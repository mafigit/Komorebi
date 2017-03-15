import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import LabelIcon from 'material-ui/svg-icons/action/label';

const error_style = {
  color: "rgb(244, 67, 54)",
  fontSize: 12
};

const colors = [
  { color: "blank", code: "#ffffff" },

  { color: "red", code: "#f44336" },
  { color: "pink", code: "#e91e63" },
  { color: "purple", code: "#9c27b0" },
  { color: "deeppurple", code: "#673ab7" },
  { color: "orange", code: "#ff5722" },

  { color: "blue", code: "#2196f3" },
  { color: "indigo", code: "#3f51b5" },
  { color: "yellow", code: "#ffeb3b" },
  { color: "green", code: "#4caf50" },
  { color: "teal", code: "#009688" },
];

export default class ColorSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state={select_value: this.props.value};
  }

  handleColorChange = (event, index, value) => {
    this.setState({select_value: value});
    if (this.props.onChange) {
      this.props.onChange(event, index, value);
    }
  }

  menuItems = () => {
    return colors.map((color, key) => {
      var icon = <LabelIcon color={color.code} />;
      return <MenuItem key={key} value={color.code} primaryText={color.color}
        leftIcon={icon}/>;
    });
  }

  componentWillUpdate = (nextProps, nextState) => {
    if (nextProps.value !== nextState.select_value) {
      this.setState({select_value: nextProps.value});
    }
  }

  render() {
    return <div>
      <SelectField value={this.state.select_value}
        onChange={this.handleColorChange}
        fullWidth={true}
        floatingLabelStyle={this.props.style}>
        {this.menuItems()}
      </SelectField>
      <div style={error_style}>{this.props.errorText}</div>
    </div>
    ;
  }
}
