import React from 'react';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

const error_style = {
  color: "rgb(244, 67, 54)",
  'fontSize': 12
};

export default class UserSelect extends React.Component {
  constructor(props) {
    super(props);
    this.state={select_value: this.props.story_id};
  }

  handleStoryChange= (event, index, value) => {
    this.setState({select_value: value});
    if (this.props.onChange) {
      this.props.onChange(event, index, value);
    }
  }

  menuItems = () => {
    return this.props.users.map((user, key) => {
      return <MenuItem key={key} value={user.id} primaryText={user.name} />;
    });
  }

  render() {
    return <div>
      <SelectField value={this.state.select_value}
        onChange={this.handleStoryChange}
        floatingLabelStyle={this.props.style}>
        {this.menuItems()}
      </SelectField>
      <div style={error_style}>{this.props.errorText}</div>
    </div>
    ;
  }
}
