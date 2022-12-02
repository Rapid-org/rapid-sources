import './Auth.scss';
import { Component } from 'react';
import firebase from 'firebase/compat';
import $ from 'jquery';
import logo from './logo.png';
import '@mui/material/Button/Button';
import '@mui/material/Checkbox/Checkbox';
import '@mui/material/CircularProgress/CircularProgress';
import '@mui/material/FormControlLabel/FormControlLabel';
import '@mui/material/Snackbar/Snackbar';
import { Backdrop, Card, CardContent, Container, Grid, Slide } from '@mui/material';
import '@mui/material/IconButton/IconButton';
import '@mui/material/TextField/TextField';
import '@mui/material/InputAdornment/InputAdornment';
import '@mui/material/FormGroup/FormGroup';
import { ThemeProvider } from '@mui/material/styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import {
  Button,
  Checkbox,
  CircularProgress,
  createTheme, FormControlLabel,
  FormGroup,
  IconButton,
  Alert,
  InputAdornment,
  Snackbar,
  TextField
} from '@mui/material';
import ToggleIcon from 'material-ui-toggle-icon';

const qs = require('query-string');


const API_SERVER_URL = window.location.host === "localhost:3000" ? "http://localhost:9980" : "https://backend.rapidbuilder.tech:9980";
let handleRedirect = true;
let isVerifyEmailLink = false;

class Auth extends Component {
  constructor(props) {
    super(props);
    this.status = { LOADING: 'loading', SIGNED_UP: 'sign_up', SIGNED_OUT: 'signed_out' };
    this.state = {
      signUpName: '',
      signUpEmail: '',
      signUpPassword: '',
      signUp: false,
      resetPasswordEmail: '',
      signInEmail: '',
      signInPassword: '',
      successSnackbarMessage: undefined,
      errorSnackbarMessage: undefined,
      infoSnackbarMessage: undefined,
      signUpPasswordVisible: false,
      signInPasswordVisible: false,
      status: this.status.LOADING,
      darkTheme: localStorage.getItem('darkMode') === 'true',
      acceptCheckboxChecked: false,
      loadingBackdrop: false,
      forgotPassword: false
    };
    // Get the action to complete.
    const mode = this.getParameterByName('mode');
    // Get the one-time code from the query parameter.
    const actionCode = this.getParameterByName('oobCode');

    // Configure the Firebase SDK.
    // This is the minimum configuration required for the API to be used.
    const firebaseConfig = {
      apiKey: 'AIzaSyB4In0zDPYf1Zaxp7bSAkd7gB7sK95SaJc',
      authDomain: 'rapid-b9abe.firebaseapp.com',
      projectId: 'rapid-b9abe',
      storageBucket: 'rapid-b9abe.appspot.com',
      messagingSenderId: '92500374975',
      appId: '1:92500374975:web:7bc67ed995a03ded0b1d0a',
      measurementId: 'G-E4CTMSZK0K'
    };

    // Initialize Firebase
    this.firebaseApp = firebase.initializeApp(firebaseConfig);
    const auth = this.firebaseApp.auth();

    // Handle the user management action.
    switch (mode) {
      case 'verifyEmail':
        console.log(mode);
        // Display email verification handler and UI.
        auth.applyActionCode(actionCode).then(() => {
          isVerifyEmailLink = true;
          this.showSuccessSnackbar('Your Rapid account has been verified!');
        }).catch((e) => {
          console.log(e);
          this.showErrorSnackbar('Your request to verify your email has expired or the link has already been used.');
        });
        break;
      default:
    }
    this.firebaseApp.auth().onAuthStateChanged((currentUser) => {
      console.log(currentUser);
      if (currentUser) {
        const parsed = qs.parse(window.location.search);
        const callbackUrl = parsed.callback;
        if (callbackUrl) {
          if (!this.state.signUp && handleRedirect) {
            window.location.replace(parsed.callback);
          }
        } else {
          let data = this.state;
          data.status = this.status.SIGNED_UP;
          this.setState(data);
        }
      } else {
        let data = this.state;
        data.status = this.status.SIGNED_OUT;
        console.log(data);
        this.setState(data);
      }
    });
  }

  getParameterByName(name) {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get(name);
  }

  render() {
    const theme = createTheme({
      palette: {
        primary: {
          main: '#6200ee'
        }
      }
    });
    return (<div id={'main'}>
      {(this.state.status === this.status.SIGNED_OUT ? (
        <ThemeProvider theme={theme}>
          <Slide direction='left' in={this.state.signUp && !this.state.forgotPassword}>
            <Card style={{ display: this.state.signUp && !this.state.forgotPassword ? 'block' : 'none' }}
                  id={'image'}>
              <CardContent>
                <Grid style={{textAlign: "center"}}>
                  <Grid item xs={12}>
                    <h2>Sign Up To Rapid </h2>
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label='Name' variant='outlined' type={'text'} style={{ marginBottom: '20px' }}
                               onChange={(e) => {
                                 const data = this.state;
                                 data.signUpName = e.target.value;
                                 this.setState(data);
                               }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label='Email' variant='outlined' type={'email'}
                               style={{ marginBottom: '20px' }}
                               onChange={(e) => {
                                 const data = this.state;
                                 data.signUpEmail = e.target.value;
                                 this.setState(data);
                               }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label='Password' variant='outlined'
                               type={this.state.signUpPasswordVisible ? 'text' : 'password'}
                               style={{ marginBottom: '20px' }}
                               InputProps={{
                                 endAdornment: <InputAdornment position='end'>
                                   <IconButton
                                     onClick={() => {
                                       const data = this.state;
                                       data.signUpPasswordVisible = !data.signUpPasswordVisible;
                                       this.setState(data);
                                     }}
                                     edge='end'
                                   >
                                     <ToggleIcon on={this.state.signUpPasswordVisible}
                                                 onIcon={<Visibility />} offIcon={<VisibilityOff />} />
                                   </IconButton>
                                 </InputAdornment>
                               }} onChange={(e) => {
                      const data = this.state;
                      data.signUpPassword = e.target.value;
                      this.setState(data);
                    }} />
                  </Grid>
                  <Grid item xs={12}>
                    <FormGroup>
                      <FormControlLabel color={'primary'} control={<Checkbox onChange={(e) => {
                        let data = this.state;
                        data.acceptCheckboxChecked = e.target.checked;
                        this.setState(data);
                      }} />} label={<div>
                        <span>I accept the </span>
                        <a rel={'noreferrer'} target={'_blank'} href={'/terms'}>terms of use</a>
                        <span> and </span>
                        <a rel={'noreferrer'} target={'_blank'} href={'/privacy'}>privacy policy</a>
                      </div>} />
                    </FormGroup>
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      disabled={!this.state.acceptCheckboxChecked || !this.state.signUpEmail || !this.state.signUpPassword || !this.state.signUpName}
                      variant='contained' color='primary' onClick={() => this.doSignUp()}
                      style={{ width: '300px'}}>
                      Sign Up
                    </Button>
                  </Grid>
                  <Grid item xs={12}>
                    <p style={{ fontFamily: 'Roboto,serif' }}>Already have an account?</p>
                  </Grid>
                  <Grid item xs={12}>
                    <u style={{ fontFamily: 'Roboto,serif', cursor: 'pointer' }}
                       onClick={() => {
                         const data = this.state;
                         data.signUp = false;
                         this.setState(data);
                       }} id='already-have-an-account-label'>Sign In</u>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>
          <Slide direction='left' in={!this.state.signUp && !this.state.forgotPassword}>
            <Card style={{ display: !this.state.signUp && !this.state.forgotPassword ? 'block' : 'none' }}
                  id={'image'}>
              <CardContent>
                <Grid style={{ display: !this.state.signUp ? 'block' : 'none', textAlign: 'center' }}>
                  <Grid item xs={12}>
                    <h2>Sign In To Rapid</h2>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField label='Email' fullWidth variant='outlined' type={'email'} style={{ marginBottom: '20px' }}
                               onChange={(e) => {
                                 const data = this.state;
                                 data.signInEmail = e.target.value;
                                 this.setState(data);
                               }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField fullWidth label='Password' variant='outlined'
                               type={this.state.signInPasswordVisible ? 'text' : 'password'}
                               style={{ marginBottom: '20px' }}
                               InputProps={{
                                 endAdornment: <InputAdornment position='end'>
                                   <IconButton
                                     onClick={() => {
                                       const data = this.state;

                                       data.signInPasswordVisible = !data.signInPasswordVisible;
                                       this.setState(data);
                                     }
                                     }
                                     edge='end'
                                   >
                                     <ToggleIcon on={this.state.signInPasswordVisible}
                                                 onIcon={<Visibility />} offIcon={<VisibilityOff />} />
                                   </IconButton>
                                 </InputAdornment>
                               }} onChange={(e) => {
                      const data = this.state;
                      data.signInPassword = e.target.value;
                      this.setState(data);
                    }} />
                  </Grid>
                  <Grid item xs={12}>
                    <Button variant='contained' color='primary' style={{ width: '300px' }}
                            onClick={() => this.doSignIn()}>
                      Sign In
                    </Button>
                  </Grid>
                  <Grid item xs={12} style={{marginTop: "10px"}}>
                    <u style={{ fontFamily: 'Roboto,serif', cursor: 'pointer' }}
                       onClick={() => {
                         const data = this.state;
                         data.forgotPassword = true;
                         this.setState(data);
                       }}>Forgot Your Password?</u>
                  </Grid>
                  <Grid item xs={12}>
                    <p style={{ fontFamily: 'Roboto,serif' }}>Don't have an account?</p>
                  </Grid>
                  <Grid item xs={12}>
                    <u style={{ fontFamily: 'Roboto,serif', cursor: 'pointer' }}
                       onClick={() => {
                         const data = this.state;
                         data.signUp = true;
                         this.setState(data);
                       }} id='dont-have-an-account-label'>Sign Up</u>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Slide>
                <Slide direction='left' in={this.state.forgotPassword}>
                  <Card style={{ display: this.state.forgotPassword ? 'block' : 'none' }}
                        id={'image'}>
                    <CardContent>
                      <Grid style={{ display: !this.state.signUp ? 'block' : 'none', textAlign: 'center' }}>
                        <Grid item xs={12}>
                          <h2>Reset Your Password</h2>
                        </Grid>

                        <Grid item xs={12}>
                          <TextField label='Email' fullWidth variant='outlined' type={'email'} style={{ marginBottom: '20px' }}
                                     onChange={(e) => {
                                       const data = this.state;
                                       data.resetPasswordEmail = e.target.value;
                                       this.setState(data);
                                     }} />
                        </Grid>
                        <Grid item xs={12}>
                          <Button disabled={!this.state.resetPasswordEmail || !this.state.resetPasswordEmail.length} variant='contained' color='primary' style={{ width: '300px' }}
                                  onClick={() => {
                                    this.openLoadingBackdrop();
                                          $.ajax(API_SERVER_URL + '/mail/reset', {
                                            type: 'POST',
                                            contentType: 'application/json',
                                            data: JSON.stringify({
                                              email: this.state.resetPasswordEmail
                                            }),
                                            success: (response) => {
                                              console.log(response);
                                              this.closeLoadingBackdrop();
                                              // Redirect the user to the callback passed in the query parameters, or show a snackbar if the query parameter isn't present.
                                              this.showSuccessSnackbar(`A reset password email has been sent to ${this.state.resetPasswordEmail}!`);
                                            },
                                            error: (error) => {
                                              this.closeLoadingBackdrop();
                                              console.log(error);
                                            }
                                          });
                                  }}>
                            Send Verification Email
                          </Button>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Slide>
        </ThemeProvider>
      ) : (this.state.status === this.status.LOADING ? <ThemeProvider theme={theme}>
        <div className={'centered-progress'}><CircularProgress sx={{ color: 'white' }} /></div>
      </ThemeProvider> : <ThemeProvider theme={theme}>
        <Card sx={{ minWidth: 460, height: '60vh' }}>
          <CardContent>
            <div className={'centered-sign-in'}><img style={{ width: '120px', height: '120px' }} src={logo}
                                                     alt={'logo'} /><h2>You are Signed In!</h2><p
              style={{ color: '#2d2c2c' }}>You can safely exit this tab.</p></div>
          </CardContent></Card>
      </ThemeProvider>))}
      <Snackbar onClose={() => this.showSuccessSnackbar(undefined)}
                open={!!this.state.successSnackbarMessage}>
        <Alert onClose={() => this.showSuccessSnackbar(undefined)} variant={'filled'} severity='success'
               sx={{ width: '100%' }}>
          {this.state.successSnackbarMessage ? this.state.successSnackbarMessage : ''}
        </Alert>
      </Snackbar>
      <Snackbar onClose={() => this.showErrorSnackbar(undefined)}
                open={!!this.state.errorSnackbarMessage}>
        <Alert onClose={() => this.showErrorSnackbar(undefined)} variant={'filled'} severity='error'
               sx={{ width: '100%' }}>
          {this.state.errorSnackbarMessage ? this.state.errorSnackbarMessage : ''}
        </Alert>
      </Snackbar>
      <Snackbar onClose={() => this.showInfoSnackbar(undefined)}
                open={!!this.state.infoSnackbarMessage}>
        <Alert onClose={() => this.showInfoSnackbar(undefined)} variant={'filled'} severity='info'
               sx={{ width: '100%' }}>
          {this.state.infoSnackbarMessage ? this.state.infoSnackbarMessage : ''}
        </Alert>
      </Snackbar>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={this.state.loadingBackdrop}
        onClick={this.closeLoadingBackdrop}
      >
        <CircularProgress color='inherit' />
      </Backdrop>
    </div>);
  }

  closeLoadingBackdrop() {
    let data = this.state;
    data.loadingBackdrop = false;
    this.setState(data);
  }

  openLoadingBackdrop() {
    let data = this.state;
    data.loadingBackdrop = true;
    this.setState(data);
  }

  showSuccessSnackbar(message) {
    const data = this.state;
    data.successSnackbarMessage = message;
    this.setState(data);
  }

  showErrorSnackbar(message) {
    const data = this.state;
    data.errorSnackbarMessage = message;
    this.setState(data);
  }

  showInfoSnackbar(message) {
    const data = this.state;
    data.infoSnackbarMessage = message;
    this.setState(data);
  }

  doSignIn() {
    // Validate Inputs
    if (!this.state.signInEmail || this.state.signInEmail.length === 0) {
      this.showErrorSnackbar('Please Enter an email address.');
      return;
    }
    console.log(this.state);
    if (!this.state.signInPassword || this.state.signInPassword.length === 0) {
      this.showErrorSnackbar('Please Enter a password.');
      return;
    }
    // Sign In Using Firebase
    handleRedirect = false;
    this.openLoadingBackdrop();
    this.firebaseApp.auth().signInWithEmailAndPassword(this.state.signInEmail, this.state.signInPassword)
      .then(() => {
        this.closeLoadingBackdrop();
        let emailVerified = firebase.auth().currentUser.emailVerified;
        if (!emailVerified) {
          firebase.auth().signOut();
          this.showInfoSnackbar('We have sent you a verification mail to your E-mail address. Please confirm your email address to log-in to your account your account.');
          return;
        }
        // Redirect the user to the callback passed in the query parameters, or show a snackbar if the query parameter isn't present.
        const parsed = qs.parse(window.location.search);
        const callbackUrl = parsed.callback;
        console.log(isVerifyEmailLink);
        if (callbackUrl) {
          window.location.replace(parsed.callback);
        } else if (isVerifyEmailLink) {
          window.location.replace('https://create.rapidbuilder.tech/client');
        } else {
          this.showSuccessSnackbar('SignIn Success!');
        }
      })
      .catch((error) => {
        this.closeLoadingBackdrop();
        let statusCode = error.code;
        if (statusCode === 'auth/user-not-found') {
          this.showErrorSnackbar('This user wasn\'t found. Please check your credentials and try again.');
        } else {
          this.showErrorSnackbar(error.message);
        }
      });
  }

  doSignUp() {
    // Validate Inputs
    if (!this.state.signUpEmail || this.state.signUpEmail.length === 0) {
      this.showErrorSnackbar('Please Enter an email address.');
      return;
    }
    if (!this.state.signUpName || this.state.signUpName.length === 0) {
      this.showErrorSnackbar('Please Enter your name.');
      return;
    }
    if (!this.state.signUpPassword || this.state.signUpPassword.length === 0) {
      this.showErrorSnackbar('Please Enter a password.');
      return;
    }
    if (!this.state.acceptCheckboxChecked) {
      this.showErrorSnackbar('Please accept the Privacy Policy & Terms of use.');
      return;
    }
    this.openLoadingBackdrop();
    $.ajax({
      url: API_SERVER_URL + '/user',
      type: 'POST',
      data: JSON.stringify({
        name: this.state.signUpName,
        email: this.state.signUpEmail,
        password: this.state.signUpPassword
      }),
      contentType: 'application/json',
      success: (response) => {
        console.log(response);
        // send verification email
        console.log(response.uid);
        $.ajax(API_SERVER_URL + '/mail/verification', {
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({
            uid: response.uid
          }),
          success: (response) => {
            console.log(response);
            this.closeLoadingBackdrop();
            // Redirect the user to the callback passed in the query parameters, or show a snackbar if the query parameter isn't present.
            this.showSuccessSnackbar(`A verification email has been sent to ${this.state.signUpEmail}!`);
          },
          error: (error) => {
            this.closeLoadingBackdrop();
            console.log(error);
          }
        });
      },
      error: (xhr) => {
        console.log(xhr.responseText);
        if (xhr.status === 400) {
          this.closeLoadingBackdrop();
          this.showErrorSnackbar(JSON.parse(xhr.responseText).error.message);
        } else {
          // if the backend server isn't configured or down, AJAX would fail to
          this.closeLoadingBackdrop();
          this.showErrorSnackbar('The backend server is temporarily down. Please contact the Support Team For More Information.');
        }
      }
    });
  }
}

export default Auth;
