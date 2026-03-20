import React, { Component } from 'react';
import { Joyride } from 'react-joyride';

class App extends Component {
  render() {
    return (
      <div className="App">
        {/* TODO: [react-joyride v3] Custom tooltipComponent: 'tooltipProps.ref' was removed in v3. Update your component. */
        }<Joyride
          steps={[{ target: '.link', content: 'Hi' }]}
          // TODO: [react-joyride v3] 'getHelpers' was removed. Use the 'controls' returned by useJoyride() instead.
          // getHelpers={(h) => { this.helpers = h; }}
          tooltipComponent={CustomTooltip}
          run={true}
        />
      </div>
    );
  }
}

function CustomTooltip(props: any) {
  return <div>{props.step.content}</div>;
}

export default App;
