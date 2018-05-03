import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Activity } from '../../../../src'
//import { ResponsiveMenu } from 'material-ui-responsive-menu';
import { withTheme } from 'material-ui/styles'
import { setDialogIsOpen } from '../../../../src/store/dialogs/actions'
import CompanyForm from '../../components/Forms/CompanyForm';
import { withRouter } from 'react-router-dom';
import Icon from 'material-ui/Icon';
import Button from 'material-ui/Button';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import { withFirebase } from 'firekit-provider'
import FireForm from 'fireform'
import { change, submit } from 'redux-form';
import isGranted from '../../../../src/utils/auth';
import IconButton from 'material-ui/IconButton';

const path = '/companies/';
const form_name = 'company';


class Company extends Component {

  validate = (values) => {
    const { intl } = this.props;
    const errors = {}

    errors.name = !values.name ? intl.formatMessage({ id: 'error_required_field' }) : '';
    errors.full_name = !values.full_name ? intl.formatMessage({ id: 'error_required_field' }) : '';
    errors.vat = !values.vat ? intl.formatMessage({ id: 'error_required_field' }) : '';

    return errors
  }

  handleClose = () => {
    const { setDialogIsOpen } = this.props;

    setDialogIsOpen('delete_company', false);

  }

  handleDelete = () => {

    const { history, match, firebaseApp } = this.props;
    const uid = match.params.uid;

    if (uid) {
      firebaseApp.database().ref().child(`${path}${uid}`).remove().then(() => {
        this.handleClose();
        history.goBack();
      })
    }
  }


  render() {

    const {
      history,
      intl,
      setDialogIsOpen,
      dialogs,
      match,
      submit,
      theme,
      isGranted,
      firebaseApp
    } = this.props;

    const uid = match.params.uid;

    return (
      <Activity
        iconStyleRight={{ width: '50%' }}
        appBarContent={
          <div style={{ display: 'flex' }}>
            {((!uid && isGranted(`create_${form_name}`)) || (!!uid && isGranted(`edit_${form_name}`))) &&
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => { submit('company') }}
              >
                <Icon className="material-icons" >save</Icon>
              </IconButton>
            }

            {(isGranted(`delete_${form_name}`)) &&
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={() => { setDialogIsOpen('delete_company', true) }}
              >
                <Icon className="material-icons" >delete</Icon>
              </IconButton>
            }
          </ div>
        }

        onBackClick={() => { history.goBack() }}
        title={intl.formatMessage({ id: match.params.uid ? 'edit_company' : 'create_company' })}>

        <div style={{ margin: 15, display: 'flex' }}>

          <FireForm
            firebaseApp={firebaseApp}
            name={'company'}
            path={`${path}`}
            validate={this.validate}
            onSubmitSuccess={(values) => { history.push('/companies'); }}
            onDelete={(values) => { history.push('/companies'); }}
            uid={match.params.uid}>
            <CompanyForm />
          </FireForm>
        </div>

        <Dialog
          open={dialogs.delete_company === true}
          onClose={this.handleClose}
          aria-labelledby="alert-dialog-title"
          aria-describedby="alert-dialog-description"
        >
          <DialogTitle id="alert-dialog-title">{intl.formatMessage({ id: 'delete_company_title' })}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-description">
              {intl.formatMessage({ id: 'delete_company_message' })}
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose} color="primary" >
              {intl.formatMessage({ id: 'cancel' })}
            </Button>
            <Button onClick={this.handleDelete} color="secondary" >
              {intl.formatMessage({ id: 'delete' })}
            </Button>
          </DialogActions>
        </Dialog>




      </Activity>
    );
  }
}

Company.propTypes = {
  history: PropTypes.object,
  intl: intlShape.isRequired,
  setDialogIsOpen: PropTypes.func.isRequired,
  dialogs: PropTypes.object.isRequired,
  match: PropTypes.object.isRequired,
  submit: PropTypes.func.isRequired,
  theme: PropTypes.object.isRequired,
  isGranted: PropTypes.func.isRequired,
};


const mapStateToProps = (state) => {
  const { intl, dialogs } = state;

  return {
    intl,
    dialogs,
    isGranted: grant => isGranted(state, grant)
  };
};

export default connect(
  mapStateToProps, { setDialogIsOpen, change, submit }
)(injectIntl(withRouter(withFirebase(withTheme()(Company)))));
