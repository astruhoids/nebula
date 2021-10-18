import React from 'react';

/** The Footer appears at the bottom of every page. Rendered by the App Layout component. */
class Footer extends React.Component {
  render() {
    const divStyle = { padding: '15px 0', color: '#3c78d8' };
    return (
      <footer>
        <div style={divStyle} className="ui center aligned container fluid" id='footer'>
          AstrUHoids <br />
          University of Hawaii<br />
          Honolulu, HI 96822 <br />
        </div>
      </footer>
    );
  }
}

export default Footer;
