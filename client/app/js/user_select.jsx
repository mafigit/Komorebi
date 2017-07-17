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
  }

  menuItems = () => {
    var users = this.props.users;
    return users.map((user, key) => {
      return <MenuItem key={key+1} value={user.id} primaryText={user.name} />;
    });
  }

  render() {
    return <div>
      <SelectField value={this.props.user_id}
        onChange={this.props.onChange}
        floatingLabelStyle={this.props.style}>
        <MenuItem key={0} value={undefined} primaryText={"No user"} />
        {this.menuItems()}
      </SelectField>
      <div style={error_style}>{this.props.errorText}</div>
    </div>
    ;
  }
}
