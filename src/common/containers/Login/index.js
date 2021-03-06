/*
This file handles firing flows of actions.
The important two are 1. signIn 2. signUp

1. signIn
This flow of actions involves both pulling and pushing.
It is called when sign in happens as long as it is not user's first time sign in.

2. signUp
This flow of actions involves pushing only.
It is called after user is verified and gets automatically signed in.
It involves pushing only because database does not have any information of this newly
registered user.
Note that its code will be borrowed by signIn when user does some change and then signs in.

Before or after all pushing and pulling, the state will be processed by redux store.
*/


import { connect } from 'react-redux';
import deepEqual from 'deep-equal';
import * as userActions from '../../actions/userActions' ;
import * as backendActions from '../../actions/backendActions' ;
import * as Errors from '../../constants/Errors' ;
import Login from '../../components/Login';
import { notifyErrorByDialog, notifySuccessBySnackbar } from '../Notification';
import { LoginModes } from '../../reducers/User';
import { initState as experimentInitState } from '../../reducers/Experiment';
import { signUpPush, signInFetchUserData, fetchExperimentById } from '../../backend/dynamoDB';

const handleClose = (dispatch) => {
	dispatch(userActions.setLoginWindowAction(false));
}

const popVerification = (dispatch) => {
	dispatch(userActions.setLoginWindowAction(true, LoginModes.verification));
}

const setLoginMode = (dispatch, mode) => {
	dispatch(userActions.setLoginWindowAction(true, mode))
}


/*
Save/fetch case: sign in .

0. Process state
1. update user data locally
if there is any change in experiment:
	2. update user data remotely
	3. update experiment data remotely
else:
	2. update experiment data locally
*/
export const signIn = (dispatch) => {
	dispatch((dispatch, getState) => {
		// sign in handled by cognito first
		// sync user state from local storage
		dispatch(userActions.signInAction());

		// fetch user data
		signInFetchUserData(
			getState().userState.user.identityId
		).then((data) => {
			if (!data) {
				throw Errors.internetError;
			}
			// update user data locally
			dispatch(backendActions.signInPullAction(data, null));
		}).then(() => {
			let anyChange = !deepEqual(experimentInitState, getState().experimentState);
			// if there is any change
			if (anyChange) {
				// almost same logic with signUp since we are
				// 1. updating user data anyway (due to new experiment)
				// 2. inserting a new experiment to data base as well
				dispatch(backendActions.signUpPushAction(anyChange));
				signUpPush(getState()).then(() => {
					notifySuccessBySnackbar(dispatch, "Saved !");
				}, (err) => {
					notifyErrorByDialog(dispatch, err.message);
				});
			} else {
				// if there is no change
				// 1. Fetch last editted experiment data
				// 2. Update experiment state locally
				let memorizedId = getState().userState.lastModifiedExperimentId;
				if (!memorizedId) return;
				fetchExperimentById(
					memorizedId,
				).then((data) => {
					if (!data) {
						throw Errors.internetError;
					}
					dispatch(backendActions.signInPullAction(null, data));
				}).catch((err) => {
					notifyErrorByDialog(dispatch, err.message);
				});
			}
		}).catch((err) => {
			notifyErrorByDialog(dispatch, err.message);
		});
	});
}
/*
Save case: create account.

0. Process state
1. inserting new user to database
2. inserting new experiment if there is one
*/
const signUp = (dispatch) => {
	dispatch((dispatch, getState) => {
		let anyChange = !deepEqual(experimentInitState, getState().experimentState);
		dispatch(backendActions.signUpPushAction(anyChange));
		signUpPush(getState()).then(() => {
			notifySuccessBySnackbar(dispatch, "Saved !");
		}, (err) => {
			notifyErrorByDialog(dispatch, err.message);
		});
	});
}

const mapStateToProps = (state, ownProps) => {
  let userState = state.userState;
  return {
  	open: userState.windowOpen,
  	loginMode: userState.loginMode
  }
}

const mapDispatchToProps = (dispatch, ownProps) => ({
	handleClose: () => { handleClose(dispatch); },
	popVerification: () => { popVerification(dispatch); },
	setLoginMode: (mode) => { setLoginMode(dispatch, mode); },
	signIn: () => { signIn(dispatch); },
	signUp: () => { signUp(dispatch); },
	notifyErrorByDialog: (message) => { notifyErrorByDialog(dispatch, message); },
})

export default connect(mapStateToProps, mapDispatchToProps)(Login);
