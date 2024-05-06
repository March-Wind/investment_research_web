import React from 'react';
class Label extends React.Component {
  onClick = () => {
    alert('clicked');
  };

  render() {
    return (
      <button
        style={{
          width: '100px',
          height: '100px',
          textAlign: 'center',
          color: '#000',
          background: '#ffd591',
          border: '2px solid #ffa940',
          borderRadius: 4,
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
        onClick={this.onClick}
      >
        React Buttonl水电费健康
      </button>
    );
  }
}
export default Label;
