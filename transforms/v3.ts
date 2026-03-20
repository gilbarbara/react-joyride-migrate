import type { API, ASTPath, FileInfo, JSCodeshift, JSXElement, ObjectExpression, Options, Property } from 'jscodeshift';

// --- Prop migration maps ---

// Props that move to `options` with a different name (same boolean semantics)
const OPTIONS_RENAMES: Record<string, string> = {
  disableOverlay: 'hideOverlay',
  disableScrolling: 'skipScroll',
  disableBeacon: 'skipBeacon',
};

// Props that move to `options` keeping the same name
const OPTIONS_SAME_NAME = ['showProgress', 'spotlightPadding', 'offset', 'scrollDuration', 'scrollOffset'] as const;

// Button visibility props -> composed into options.buttons array
const BUTTON_PROPS = new Set(['hideBackButton', 'hideCloseButton', 'showSkipButton', 'hideFooter']);

// Step-only field renames
const STEP_FIELD_RENAMES: Record<string, string> = {
  event: 'beaconTrigger',
  placementBeacon: 'beaconPlacement',
};

// Styles removed in v3
const REMOVED_STYLES = new Set(['spotlight', 'spotlightLegacy', 'overlayLegacy', 'overlayLegacyCenter']);

// --- Type migration maps ---

const TYPE_RENAMES: Record<string, string> = {
  Callback: 'EventHandler',
  CallBackProps: 'EventData',
  StoreHelpers: 'Controls',
  StylesWithFloaterStyles: 'Styles',
  FloaterProps: 'FloatingOptions',
};

// Types that get a TODO when renamed (API changed significantly)
const TYPE_RENAME_TODOS = new Set(['FloaterProps']);

// --- TODO messages ---

const TODO = '// TODO: [react-joyride v3]';

const TODO_MESSAGES: Record<string, string> = {
  getHelpers: `${TODO} 'getHelpers' was removed. Use the 'controls' returned by useJoyride() instead.`,
  floaterProps: `${TODO} 'floaterProps' renamed to 'floatingOptions' with a different API (@floating-ui instead of react-floater). Review and update the options.`,
  disableScrollParentFix: `${TODO} 'disableScrollParentFix' was removed with no replacement.`,
  spreadProps: `${TODO} Verify spread props are v3-compatible. Check for: overlayClickAction, blockTargetInteraction, floatingOptions, buttons, dismissKeyAction.`,
  tooltipComponent: `${TODO} Custom tooltipComponent: 'tooltipProps.ref' was removed in v3. Update your component.`,
  FloaterProps: `${TODO} 'FloaterProps' type was removed. Use FloatingOptions instead.`,
  createElement: `${TODO} React.createElement(Joyride, ...) detected. Manually migrate to JSX or useJoyride().`,
  stylesRemoved: `${TODO} Removed styles (spotlight/overlay legacy) are no longer supported. SVG overlay replaces CSS spotlight.`,
  stylesIdentifier: `${TODO} 'styles' prop uses a variable. Check for: styles.options (move to options prop), buttonNext (rename to buttonPrimary), removed styles (spotlight, overlayLegacy).`,
  lifecycleError: `${TODO} 'LIFECYCLE.ERROR' was removed. Errors now use the 'error' event type.`,
  statusError: `${TODO} 'STATUS.ERROR' was removed. Errors now use the 'error' event type.`,
  buttonsDynamic: `${TODO} Dynamic button visibility prop detected. Manually convert to options.buttons array: ['back', 'close', 'primary', 'skip'].`,
  spotlightClicksRemoved: `${TODO} 'spotlightClicks' was removed (v3 default: blockTargetInteraction is false).`,
};

// Canonical button order
const BUTTON_ORDER = ['back', 'close', 'primary', 'skip'];

// --- Main transformer ---

export default function transformer(file: FileInfo, api: API, _options: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  let hasChanges = false;

  const importResult = migrateImport(root, j);

  if (importResult.changed) {
    hasChanges = true;
  }

  const localName = importResult.localName;

  if (!localName) {
    return undefined;
  }

  if (migrateTypeImports(root, j)) {
    hasChanges = true;
  }

  if (migrateRemovedConstants(root, j)) {
    hasChanges = true;
  }

  if (migrateCreateElementCalls(root, j, localName)) {
    hasChanges = true;
  }

  root.findJSXElements(localName).forEach(path => {
    if (migrateProps(path, j, file.source, root)) {
      hasChanges = true;
    }
  });

  if (migrateStepArrays(root, j)) {
    hasChanges = true;
  }

  return hasChanges ? root.toSource({ quote: 'single' }) : undefined;
}

// --- Import migration (default -> named) ---

function migrateImport(
  root: ReturnType<JSCodeshift>,
  j: JSCodeshift,
): { changed: boolean; localName: string | null } {
  let changed = false;
  let localName: string | null = null;

  root.find(j.ImportDeclaration, { source: { value: 'react-joyride' } }).forEach(path => {
    const specifiers = path.node.specifiers;

    if (!specifiers) {
      return;
    }

    const defaultIdx = specifiers.findIndex(s => s.type === 'ImportDefaultSpecifier');

    if (defaultIdx >= 0) {
      const defaultSpec = specifiers[defaultIdx];
      const name = (defaultSpec.local as any)?.name as string;

      const namedSpec =
        name === 'Joyride'
          ? j.importSpecifier(j.identifier('Joyride'))
          : j.importSpecifier(j.identifier('Joyride'), j.identifier(name));

      specifiers.splice(defaultIdx, 1, namedSpec);
      localName = name;
      changed = true;
    } else {
      const existing = specifiers.find(
        s => s.type === 'ImportSpecifier' && (s.imported as any)?.name === 'Joyride',
      );

      if (existing?.local) {
        localName = (existing.local as any).name;
      }
    }
  });

  return { changed, localName };
}

// --- Type import migration ---

function migrateTypeImports(root: ReturnType<JSCodeshift>, j: JSCodeshift): boolean {
  let changed = false;
  const renames: Array<{ oldName: string; newName: string }> = [];

  root.find(j.ImportDeclaration, { source: { value: 'react-joyride' } }).forEach(path => {
    const specifiers = path.node.specifiers;

    if (!specifiers) {
      return;
    }

    specifiers.forEach((specifier) => {
      if (specifier.type !== 'ImportSpecifier' || !specifier.imported) {
        return;
      }

      const importedName = specifier.imported.type === 'Identifier' ? specifier.imported.name : undefined;

      if (!importedName) {
        return;
      }

      if (TYPE_RENAMES[importedName]) {
        const localName = (specifier.local as any)?.name as string | undefined;
        const newName = TYPE_RENAMES[importedName];

        if (localName === importedName) {
          renames.push({ oldName: importedName, newName });
          specifier.local = j.identifier(newName);
        }

        specifier.imported = j.identifier(newName);
        changed = true;

        if (TYPE_RENAME_TODOS.has(importedName)) {
          addTodoComment(path, j, TODO_MESSAGES[importedName]);
        }
      }
    });
  });

  for (const { oldName, newName } of renames) {
    root.find(j.Identifier, { name: oldName }).forEach(idPath => {
      idPath.node.name = newName;
    });

    renameInTypeAnnotations(root, oldName, newName);
  }

  return changed;
}

function renameInTypeAnnotations(root: ReturnType<JSCodeshift>, oldName: string, newName: string): void {
  function walkAndRename(node: any): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    if (node.type === 'Identifier' && node.name === oldName) {
      node.name = newName;
    }

    for (const key of Object.keys(node)) {
      if (['loc', 'start', 'end', 'tokens', 'comments'].includes(key)) {
        continue;
      }

      const value = node[key];

      if (Array.isArray(value)) {
        for (const item of value) {
          if (item && typeof item === 'object') {
            walkAndRename(item);
          }
        }
      } else if (value && typeof value === 'object' && value.type) {
        walkAndRename(value);
      }
    }
  }

  root.paths()[0].node.program.body.forEach((statement: any) => {
    walkAndRename(statement);
  });
}

// --- JSX prop migration ---

function migrateProps(path: ASTPath<JSXElement>, j: JSCodeshift, source: string, root: ReturnType<JSCodeshift>): boolean {
  let changed = false;
  const openingElement = path.node.openingElement;
  const attributes = openingElement.attributes;

  if (!attributes) {
    return false;
  }

  const optionEntries: Array<{ name: string; value: any }> = [];
  const buttonEntries: Array<{ name: string; value: any }> = [];
  const toRemove: number[] = [];
  let hasSpreadProps = false;
  let existingOptionsIndex = -1;

  for (const attr of attributes) {
    if (attr.type === 'JSXSpreadAttribute') {
      hasSpreadProps = true;
    }
  }

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i];

    if (attr.type !== 'JSXAttribute' || !attr.name || attr.name.type !== 'JSXIdentifier') {
      continue;
    }

    const propName = attr.name.name;

    if (propName === 'options') {
      existingOptionsIndex = i;
      continue;
    }

    // callback -> onEvent
    if (propName === 'callback') {
      attr.name.name = 'onEvent';
      changed = true;
      continue;
    }

    // Simple renames -> options
    if (OPTIONS_RENAMES[propName]) {
      optionEntries.push({ name: OPTIONS_RENAMES[propName], value: extractAttrValue(attr, j) });
      toRemove.push(i);
      changed = true;
      continue;
    }

    // Same-name relocations -> options
    if ((OPTIONS_SAME_NAME as readonly string[]).includes(propName)) {
      optionEntries.push({ name: propName, value: extractAttrValue(attr, j) });
      toRemove.push(i);
      changed = true;
      continue;
    }

    // Button visibility props
    if (BUTTON_PROPS.has(propName)) {
      buttonEntries.push({ name: propName, value: extractAttrValue(attr, j) });
      toRemove.push(i);
      changed = true;
      continue;
    }

    // disableCloseOnEsc -> dismissKeyAction (value transform)
    if (propName === 'disableCloseOnEsc') {
      const result = transformDisableCloseOnEsc(extractAttrValue(attr, j), j);

      if (result) {
        optionEntries.push(result);
      }

      toRemove.push(i);
      changed = true;
      continue;
    }

    // disableOverlayClose -> overlayClickAction (inversion)
    if (propName === 'disableOverlayClose') {
      const result = invertDisableOverlayClose(attr, j);

      if (result) {
        optionEntries.push(result);
      }

      toRemove.push(i);
      changed = true;
      continue;
    }

    // spotlightClicks -> blockTargetInteraction (inversion)
    if (propName === 'spotlightClicks') {
      const result = invertSpotlightClicks(attr, j);

      if (result) {
        optionEntries.push(result);
      } else {
        addTodoComment(path, j, TODO_MESSAGES.spotlightClicksRemoved);
      }

      toRemove.push(i);
      changed = true;
      continue;
    }

    // floaterProps -> floatingOptions + TODO
    if (propName === 'floaterProps') {
      attr.name.name = 'floatingOptions';
      addTodoComment(path, j, TODO_MESSAGES.floaterProps);
      changed = true;
      continue;
    }

    // getHelpers -> comment out + TODO
    if (propName === 'getHelpers') {
      commentOutJSXAttribute(attr, i, attributes, toRemove, path, j, source, TODO_MESSAGES.getHelpers);
      toRemove.push(i);
      changed = true;
      continue;
    }

    // disableScrollParentFix -> remove + TODO
    if (propName === 'disableScrollParentFix') {
      toRemove.push(i);
      addTodoComment(path, j, TODO_MESSAGES.disableScrollParentFix);
      changed = true;
      continue;
    }

    // tooltipComponent -> TODO
    if (propName === 'tooltipComponent') {
      addTodoComment(path, j, TODO_MESSAGES.tooltipComponent);
      changed = true;
      continue;
    }

    // styles -> migrate
    if (propName === 'styles') {
      if (attr.value?.type === 'JSXExpressionContainer') {
        const expr = attr.value.expression;

        if (expr.type === 'ObjectExpression') {
          const result = migrateStylesObject(expr, j);

          if (result.extractedOptions.length > 0) {
            for (const p of result.extractedOptions) {
              const key = (p as any).key;

              optionEntries.push({
                name: key.name || key.value,
                value: (p as any).value,
              });
            }
          }

          if (result.hadRemovedStyles) {
            addTodoComment(path, j, TODO_MESSAGES.stylesRemoved);
          }

          if (result.changed) {
            changed = true;
          }

          if (result.isEmpty) {
            toRemove.push(i);
          }
        } else if (expr.type === 'Identifier') {
          const varResult = migrateStylesVariable(root, expr.name, j);

          if (varResult) {
            if (varResult.extractedOptions.length > 0) {
              for (const p of varResult.extractedOptions) {
                const key = (p as any).key;

                optionEntries.push({
                  name: key.name || key.value,
                  value: (p as any).value,
                });
              }
            }

            if (varResult.hadRemovedStyles) {
              addTodoComment(path, j, TODO_MESSAGES.stylesRemoved);
            }

            if (varResult.changed) {
              changed = true;
            }

            if (varResult.isEmpty) {
              toRemove.push(i);
            }
          }
        }
      }

      continue;
    }

    // locale -> migrate
    if (propName === 'locale') {
      if (attr.value?.type === 'JSXExpressionContainer') {
        const expr = attr.value.expression;

        if (expr.type === 'ObjectExpression') {
          if (migrateLocaleObject(expr, j)) {
            changed = true;
          }
        } else if (expr.type === 'Identifier') {
          if (migrateLocaleVariable(root, expr.name, j)) {
            changed = true;
          }
        }
      }

      continue;
    }
  }

  // Remove collected attributes in reverse order
  for (const idx of toRemove.sort((a, b) => b - a)) {
    attributes.splice(idx, 1);
  }

  // Recalculate existingOptionsIndex after removals
  if (existingOptionsIndex >= 0) {
    const removedBefore = toRemove.filter(idx => idx < existingOptionsIndex).length;

    existingOptionsIndex -= removedBefore;
  }

  // Build buttons array
  if (buttonEntries.length > 0) {
    const buttonsResult = buildButtonsArray(buttonEntries, j);

    if (buttonsResult.hasDynamic) {
      addTodoComment(path, j, TODO_MESSAGES.buttonsDynamic);
    }

    if (buttonsResult.prop) {
      optionEntries.push(buttonsResult.prop);
    }

    changed = true;
  }

  // Build/merge options prop
  if (optionEntries.length > 0) {
    const properties = optionEntries.map(({ name, value }) =>
      j.property('init', j.identifier(name), value),
    );

    if (existingOptionsIndex >= 0) {
      const existingAttr = attributes[existingOptionsIndex];

      if (existingAttr.type === 'JSXAttribute' && existingAttr.value?.type === 'JSXExpressionContainer') {
        const expr = existingAttr.value.expression;

        if (expr.type === 'ObjectExpression') {
          expr.properties.push(...properties);
        }
      }
    } else {
      const optionsObj = j.objectExpression(properties);
      const optionsAttr = j.jsxAttribute(
        j.jsxIdentifier('options'),
        j.jsxExpressionContainer(optionsObj),
      );

      attributes.push(optionsAttr);
    }

    changed = true;
  }

  // Add run={true} if missing
  const hasRunProp = attributes.some(
    attr =>
      attr.type === 'JSXAttribute' &&
      attr.name?.type === 'JSXIdentifier' &&
      attr.name.name === 'run',
  );

  if (!hasRunProp) {
    attributes.push(
      j.jsxAttribute(j.jsxIdentifier('run'), j.jsxExpressionContainer(j.literal(true))),
    );
    changed = true;
  }

  // Spread props warning
  if (hasSpreadProps) {
    addTodoComment(path, j, TODO_MESSAGES.spreadProps);
    changed = true;
  }

  return changed;
}

// --- Step array migration ---

function migrateStepArrays(root: ReturnType<JSCodeshift>, j: JSCodeshift): boolean {
  let changed = false;

  root.find(j.JSXAttribute, { name: { name: 'steps' } }).forEach(attrPath => {
    const attr = attrPath.node;

    if (!attr.value || attr.value.type !== 'JSXExpressionContainer') {
      return;
    }

    const expr = attr.value.expression;

    if (expr.type === 'ArrayExpression') {
      if (migrateStepObjectsInArray(expr, j)) {
        changed = true;
      }
    } else if (expr.type === 'Identifier') {
      const varName = expr.name;

      root.find(j.VariableDeclarator, { id: { name: varName } }).forEach(varPath => {
        const init = varPath.node.init;

        if (init?.type === 'ArrayExpression') {
          if (migrateStepObjectsInArray(init, j)) {
            changed = true;
          }
        }

        if (init?.type === 'TSAsExpression' && (init as any).expression.type === 'ArrayExpression') {
          if (migrateStepObjectsInArray((init as any).expression, j)) {
            changed = true;
          }
        }

        if (init?.type === 'TSSatisfiesExpression' && (init as any).expression.type === 'ArrayExpression') {
          if (migrateStepObjectsInArray((init as any).expression, j)) {
            changed = true;
          }
        }
      });
    }
  });

  return changed;
}

function migrateStepObjectsInArray(arrayExpr: any, j: JSCodeshift): boolean {
  let changed = false;

  for (const element of arrayExpr.elements) {
    if (!element || element.type !== 'ObjectExpression') {
      continue;
    }

    if (migrateStepObject(element, j)) {
      changed = true;
    }
  }

  return changed;
}

function migrateStepObject(obj: ObjectExpression, j: JSCodeshift): boolean {
  let changed = false;
  const properties = obj.properties;
  const toRemove: number[] = [];
  const buttonEntries: Array<{ name: string; value: any }> = [];
  const toAdd: any[] = [];
  let hadScrollParentFix = false;
  let hadSpotlightClicksRemoved = false;
  let hadRemovedStyles = false;

  for (let i = 0; i < properties.length; i++) {
    const prop = properties[i];

    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') {
      continue;
    }

    const key = prop.key;

    if (key.type !== 'Identifier') {
      continue;
    }

    const propName = key.name;

    // Simple renames (stay on step object as direct properties)
    if (OPTIONS_RENAMES[propName]) {
      key.name = OPTIONS_RENAMES[propName];
      changed = true;
      continue;
    }

    // Step-specific field renames
    if (STEP_FIELD_RENAMES[propName]) {
      key.name = STEP_FIELD_RENAMES[propName];
      changed = true;
      continue;
    }

    // Button visibility props
    if (BUTTON_PROPS.has(propName)) {
      buttonEntries.push({ name: propName, value: (prop as Property).value });
      toRemove.push(i);
      changed = true;
      continue;
    }

    // disableCloseOnEsc -> dismissKeyAction (value transform)
    if (propName === 'disableCloseOnEsc') {
      const value = (prop as Property).value;
      const result = transformDisableCloseOnEsc(value, j);

      if (result) {
        properties[i] = j.property('init', j.identifier(result.name), result.value);
      } else {
        toRemove.push(i);
      }

      changed = true;
      continue;
    }

    // disableOverlayClose -> overlayClickAction (inversion)
    if (propName === 'disableOverlayClose') {
      const value = (prop as Property).value;
      const boolVal = getBooleanLiteralValue(value);

      if (boolVal === true) {
        properties[i] = j.property('init', j.identifier('overlayClickAction'), j.literal(false));
      } else if (boolVal === false) {
        toRemove.push(i);
      } else {
        const ternary = j.conditionalExpression(value as any, j.literal(false), j.literal('close'));

        properties[i] = j.property('init', j.identifier('overlayClickAction'), ternary);
      }

      changed = true;
      continue;
    }

    // spotlightClicks -> blockTargetInteraction (inversion)
    if (propName === 'spotlightClicks') {
      const value = (prop as Property).value;
      const boolVal = getBooleanLiteralValue(value);

      if (boolVal === true) {
        toRemove.push(i);
        hadSpotlightClicksRemoved = true;
      } else if (boolVal === false) {
        properties[i] = j.property('init', j.identifier('blockTargetInteraction'), j.literal(true));
      } else {
        const ternary = j.conditionalExpression(value as any, j.literal(false), j.literal(true));

        properties[i] = j.property('init', j.identifier('blockTargetInteraction'), ternary);
      }

      changed = true;
      continue;
    }

    // floaterProps -> floatingOptions + TODO
    if (propName === 'floaterProps') {
      key.name = 'floatingOptions';
      addTodoCommentToProperty(prop as Property, j, TODO_MESSAGES.floaterProps);
      changed = true;
      continue;
    }

    // disableScrollParentFix -> remove + TODO
    if (propName === 'disableScrollParentFix') {
      toRemove.push(i);
      hadScrollParentFix = true;
      changed = true;
      continue;
    }

    // styles migration
    if (propName === 'styles') {
      const value = (prop as Property).value;

      if (value.type === 'ObjectExpression') {
        const result = migrateStylesObject(value, j);

        if (result.extractedOptions.length > 0) {
          toAdd.push(...result.extractedOptions);
        }

        if (result.hadRemovedStyles) {
          hadRemovedStyles = true;
        }

        if (result.changed) {
          changed = true;
        }

        if (result.isEmpty) {
          toRemove.push(i);
        }
      }

      continue;
    }

    // locale migration
    if (propName === 'locale') {
      const value = (prop as Property).value;

      if (value.type === 'ObjectExpression') {
        if (migrateLocaleObject(value, j)) {
          changed = true;
        }
      }

      continue;
    }
  }

  // Build buttons array
  if (buttonEntries.length > 0) {
    const buttonsResult = buildButtonsArray(buttonEntries, j);

    if (buttonsResult.prop) {
      toAdd.push(j.property('init', j.identifier(buttonsResult.prop.name), buttonsResult.prop.value));
    }

    changed = true;
  }

  // Check for disableScrollParentFix before removal
  const hasScrollParentFix = hadScrollParentFix && properties.some((p: any) =>
    (p.type === 'Property' || p.type === 'ObjectProperty') &&
    p.key?.type === 'Identifier' && p.key.name === 'disableScrollParentFix',
  );

  // Remove in reverse
  for (const idx of toRemove.sort((a, b) => b - a)) {
    properties.splice(idx, 1);
  }

  // Add TODO for removed disableScrollParentFix
  if (hasScrollParentFix && properties.length > 0) {
    const lastProp = properties[properties.length - 1];

    addTodoCommentToProperty(lastProp as Property, j, TODO_MESSAGES.disableScrollParentFix);
  }

  // Add TODO for removed spotlightClicks
  if (hadSpotlightClicksRemoved && properties.length > 0) {
    const lastProp = properties[properties.length - 1];

    addTodoCommentToProperty(lastProp as Property, j, TODO_MESSAGES.spotlightClicksRemoved);
  }

  // Add TODO for removed styles
  if (hadRemovedStyles && properties.length > 0) {
    const lastProp = properties[properties.length - 1];

    addTodoCommentToProperty(lastProp as Property, j, TODO_MESSAGES.stylesRemoved);
  }

  // Add new properties
  if (toAdd.length > 0) {
    properties.push(...toAdd);
    changed = true;
  }

  return changed;
}

// --- Styles object migration ---

function migrateStylesObject(
  obj: ObjectExpression,
  _j: JSCodeshift,
): { extractedOptions: any[]; changed: boolean; isEmpty: boolean; hadRemovedStyles: boolean } {
  const extractedOptions: any[] = [];
  let changed = false;
  let hadRemovedStyles = false;
  const toRemove: number[] = [];

  for (let i = 0; i < obj.properties.length; i++) {
    const prop = obj.properties[i];

    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') {
      continue;
    }

    const key = prop.key;

    if (key.type !== 'Identifier') {
      continue;
    }

    if (key.name === 'options' && (prop as Property).value.type === 'ObjectExpression') {
      const optionsObj = (prop as Property).value as ObjectExpression;

      extractedOptions.push(...optionsObj.properties);
      toRemove.push(i);
      changed = true;
      continue;
    }

    if (key.name === 'buttonNext') {
      key.name = 'buttonPrimary';
      changed = true;
      continue;
    }

    if (REMOVED_STYLES.has(key.name)) {
      toRemove.push(i);
      hadRemovedStyles = true;
      changed = true;
      continue;
    }
  }

  for (const idx of toRemove.sort((a, b) => b - a)) {
    obj.properties.splice(idx, 1);
  }

  return { extractedOptions, changed, isEmpty: obj.properties.length === 0, hadRemovedStyles };
}

// --- Locale object migration ---

function migrateLocaleObject(obj: ObjectExpression, j: JSCodeshift): boolean {
  let changed = false;

  for (const prop of obj.properties) {
    if (prop.type !== 'Property' && prop.type !== 'ObjectProperty') {
      continue;
    }

    const key = prop.key;

    if (key.type !== 'Identifier') {
      continue;
    }

    if (key.name === 'nextLabelWithProgress') {
      key.name = 'nextWithProgress';
      changed = true;

      const value = (prop as Property).value;

      if (value.type === 'StringLiteral' || (value.type === 'Literal' && typeof (value as any).value === 'string')) {
        const str = (value as any).value as string;
        const newStr = str.replace(/\{step\}/g, '{current}').replace(/\{steps\}/g, '{total}');

        if (newStr !== str) {
          (prop as Property).value = j.literal(newStr);
        }
      }
    }
  }

  return changed;
}

// --- Removed constants migration ---

function migrateRemovedConstants(root: ReturnType<JSCodeshift>, j: JSCodeshift): boolean {
  let changed = false;

  root.find(j.MemberExpression).forEach(path => {
    const { object, property } = path.node;

    if (object.type !== 'Identifier' || property.type !== 'Identifier') {
      return;
    }

    if (object.name === 'LIFECYCLE' && property.name === 'ERROR') {
      addTodoComment(findContainingStatement(path), j, TODO_MESSAGES.lifecycleError);
      changed = true;
    }

    if (object.name === 'STATUS' && property.name === 'ERROR') {
      addTodoComment(findContainingStatement(path), j, TODO_MESSAGES.statusError);
      changed = true;
    }
  });

  return changed;
}

// --- createElement detection ---

function migrateCreateElementCalls(root: ReturnType<JSCodeshift>, j: JSCodeshift, importName: string): boolean {
  let changed = false;

  root.find(j.CallExpression).forEach(path => {
    const callee = path.node.callee;
    let isCreateElement = false;

    if (
      callee.type === 'MemberExpression' &&
      callee.object.type === 'Identifier' &&
      callee.object.name === 'React' &&
      callee.property.type === 'Identifier' &&
      callee.property.name === 'createElement'
    ) {
      isCreateElement = true;
    }

    if (callee.type === 'Identifier' && callee.name === 'createElement') {
      isCreateElement = true;
    }

    if (!isCreateElement) {
      return;
    }

    const firstArg = path.node.arguments[0];

    if (firstArg?.type === 'Identifier' && firstArg.name === importName) {
      addTodoComment(path, j, TODO_MESSAGES.createElement);
      changed = true;
    }
  });

  return changed;
}

// --- Helpers ---

function findContainingStatement(path: ASTPath<any>): ASTPath<any> {
  let current = path;

  while (current.parent) {
    const parentType = current.parent.node.type;

    if (
      parentType === 'Program' ||
      parentType === 'ExpressionStatement' ||
      parentType === 'IfStatement' ||
      parentType === 'VariableDeclaration' ||
      parentType === 'ReturnStatement' ||
      parentType === 'SwitchCase'
    ) {
      return current.parent;
    }

    current = current.parent;
  }

  return path;
}

function migrateLocaleVariable(root: ReturnType<JSCodeshift>, varName: string, j: JSCodeshift): boolean {
  let changed = false;

  root.find(j.VariableDeclarator, { id: { name: varName } }).forEach(varPath => {
    const init = varPath.node.init;

    if (init?.type === 'ObjectExpression') {
      if (migrateLocaleObject(init, j)) {
        changed = true;
      }
    }
  });

  return changed;
}

function migrateStylesVariable(
  root: ReturnType<JSCodeshift>,
  varName: string,
  j: JSCodeshift,
): { extractedOptions: any[]; changed: boolean; isEmpty: boolean; hadRemovedStyles: boolean } | null {
  let result: { extractedOptions: any[]; changed: boolean; isEmpty: boolean; hadRemovedStyles: boolean } | null = null;

  root.find(j.VariableDeclarator, { id: { name: varName } }).forEach(varPath => {
    const init = varPath.node.init;

    if (init?.type === 'ObjectExpression') {
      result = migrateStylesObject(init, j);
    }
  });

  return result;
}

function extractAttrValue(attr: any, j: JSCodeshift): any {
  if (!attr.value) {
    return j.literal(true);
  }

  if (attr.value.type === 'JSXExpressionContainer') {
    return attr.value.expression;
  }

  return attr.value;
}

function getBooleanLiteralValue(node: any): boolean | null {
  if (node.type === 'BooleanLiteral') {
    return node.value;
  }

  if (node.type === 'Literal' && typeof node.value === 'boolean') {
    return node.value;
  }

  return null;
}

function transformDisableCloseOnEsc(value: any, j: JSCodeshift): { name: string; value: any } | null {
  const boolVal = getBooleanLiteralValue(value);

  if (boolVal === true) {
    return { name: 'dismissKeyAction', value: j.literal(false) };
  }

  if (boolVal === false) {
    return null;
  }

  return {
    name: 'dismissKeyAction',
    value: j.conditionalExpression(value, j.literal(false), j.literal('close')),
  };
}

function invertDisableOverlayClose(attr: any, j: JSCodeshift): { name: string; value: any } | null {
  const value = extractAttrValue(attr, j);
  const boolVal = getBooleanLiteralValue(value);

  if (boolVal === true) {
    return { name: 'overlayClickAction', value: j.literal(false) };
  }

  if (boolVal === false) {
    return null;
  }

  return {
    name: 'overlayClickAction',
    value: j.conditionalExpression(value, j.literal(false), j.literal('close')),
  };
}

function invertSpotlightClicks(attr: any, j: JSCodeshift): { name: string; value: any } | null {
  const value = extractAttrValue(attr, j);
  const boolVal = getBooleanLiteralValue(value);

  if (boolVal === true) {
    return null;
  }

  if (boolVal === false) {
    return { name: 'blockTargetInteraction', value: j.literal(true) };
  }

  return {
    name: 'blockTargetInteraction',
    value: j.conditionalExpression(value, j.literal(false), j.literal(true)),
  };
}

function buildButtonsArray(
  buttonProps: Array<{ name: string; value: any }>,
  j: JSCodeshift,
): { prop: { name: string; value: any } | null; hasDynamic: boolean } {
  const defaults = new Set(['back', 'close', 'primary']);
  let buttons = new Set(defaults);
  let hasDynamic = false;
  let hasHideFooter = false;

  for (const { name, value } of buttonProps) {
    const boolVal = getBooleanLiteralValue(value);

    if (boolVal === null) {
      hasDynamic = true;
      continue;
    }

    if (name === 'hideFooter' && boolVal === true) {
      hasHideFooter = true;
    } else if (name === 'hideBackButton' && boolVal === true) {
      buttons.delete('back');
    } else if (name === 'hideCloseButton' && boolVal === true) {
      buttons.delete('close');
    } else if (name === 'showSkipButton' && boolVal === true) {
      buttons.add('skip');
    }
  }

  if (hasHideFooter) {
    buttons = new Set();
  }

  const isDefault =
    !hasHideFooter &&
    buttons.size === defaults.size &&
    [...buttons].every(b => defaults.has(b));

  if (isDefault && !hasDynamic) {
    return { prop: null, hasDynamic: false };
  }

  const orderedButtons = BUTTON_ORDER.filter(b => buttons.has(b));
  const buttonsArray = j.arrayExpression(orderedButtons.map(b => j.literal(b)));

  return {
    prop: { name: 'buttons', value: buttonsArray },
    hasDynamic,
  };
}

function commentOutJSXAttribute(
  attr: any,
  attrIndex: number,
  attributes: any[],
  toRemove: number[],
  path: ASTPath<JSXElement>,
  j: JSCodeshift,
  source: string,
  todoMessage: string,
): void {
  const commentText = todoMessage.replace('//', '').trim();

  // Extract original source text of the attribute
  const attrSource = (attr.start != null && attr.end != null)
    ? source.slice(attr.start, attr.end)
    : `${attr.name.name}={...}`;

  // Find the next attribute that won't be removed (to attach comments to)
  let targetAttr: any = null;

  for (let k = attrIndex + 1; k < attributes.length; k++) {
    if (!toRemove.includes(k)) {
      targetAttr = attributes[k];
      break;
    }
  }

  // If no next attribute, try previous
  if (!targetAttr) {
    for (let k = attrIndex - 1; k >= 0; k--) {
      if (!toRemove.includes(k)) {
        targetAttr = attributes[k];
        break;
      }
    }
  }

  if (targetAttr) {
    if (!targetAttr.comments) {
      targetAttr.comments = [];
    }

    const todoComment = j.commentLine(` ${commentText}`, true, false);

    todoComment.leading = true;
    targetAttr.comments.push(todoComment);

    for (const line of attrSource.split('\n')) {
      const c = j.commentLine(` ${line.trim()}`, true, false);

      c.leading = true;
      targetAttr.comments.push(c);
    }
  } else {
    // No remaining attributes — fall back to element-level comment
    addTodoComment(path, j, todoMessage);
  }
}

function addTodoComment(path: ASTPath<any>, j: JSCodeshift, message: string): void {
  const commentText = message.replace('//', '').trim();
  const isJSXChild =
    path.parent?.node?.type === 'JSXElement' ||
    path.parent?.node?.type === 'JSXFragment';

  if (isJSXChild) {
    const parentChildren = path.parent.node.children;
    const childIndex = parentChildren.indexOf(path.node);

    // Deduplicate: check if preceding sibling already has this comment
    if (childIndex > 0) {
      const prev = parentChildren[childIndex - 1];

      if (
        prev?.type === 'JSXExpressionContainer' &&
        prev.expression?.type === 'JSXEmptyExpression' &&
        prev.expression.comments?.some((c: any) => c.value.trim() === commentText)
      ) {
        return;
      }
    }

    const emptyExpr = j.jsxEmptyExpression();

    (emptyExpr as any).comments = [j.commentBlock(` ${commentText} `)];

    const commentContainer = j.jsxExpressionContainer(emptyExpr);

    parentChildren.splice(childIndex, 0, commentContainer);

    return;
  }

  const commentValue = ` ${commentText}`;
  const comment = j.commentLine(commentValue, true, false);
  const node = path.node;

  if (!node.comments) {
    node.comments = [];
  }

  if (node.comments.some((c: any) => c.value === commentValue)) {
    return;
  }

  comment.leading = true;
  node.comments.push(comment);
}

function addTodoCommentToProperty(prop: Property, j: JSCodeshift, message: string): void {
  const commentValue = ` ${message.replace('//', '').trim()}`;
  const comment = j.commentLine(commentValue, true, false);

  if (!prop.comments) {
    prop.comments = [];
  }

  if (prop.comments.some((c: any) => c.value === commentValue)) {
    return;
  }

  comment.leading = true;
  prop.comments.push(comment);
}
