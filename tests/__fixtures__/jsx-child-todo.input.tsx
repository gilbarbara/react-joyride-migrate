import React, { Component } from 'react';
import Joyride from 'react-joyride';

class App extends Component {
  render() {
    return (
      <div className="App">
        <Joyride
          steps={[{ target: '.link', content: 'Hi' }]}
          getHelpers={(h) => { this.helpers = h; }}
          tooltipComponent={CustomTooltip}
        />
      </div>
    );
  }
}

function CustomTooltip(props: any) {
  return <div>{props.step.content}</div>;
}

export default App;
