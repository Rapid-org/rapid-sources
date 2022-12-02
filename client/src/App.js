import './App.scss';
import logo from './logo.png';
import aboutDialog from './about_dialog.png';
import React from 'react';
import JSZip from 'jszip';
import CodeEditor from '@uiw/react-textarea-code-editor';
import { Swiper, SwiperSlide } from 'swiper/react/swiper-react'
import 'swiper/swiper.min.css'
import { withTranslation } from 'react-i18next';
import { readAndCompressImage } from 'browser-image-resizer';
import { FreeMode } from "swiper";

import "swiper/swiper.min.css";
import Lottie from 'react-lottie-player';
import welcomeLottieJson from './9757-welcome.json';
import searchNotFoundLottieJson from './search-not-found.json'
import librariesLottieJson from './libraries-notfound.json';
import i18next from 'i18next';
import { SketchPicker } from 'react-color';

import {
  Alert,
  Autocomplete,
  Avatar,
  Backdrop,
  Box,
  Button,
  Card,
  CardActionArea,
  CardActions,
  CardContent,
  Checkbox,
  CircularProgress,
  createTheme,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  FormHelperText,
  Grid,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Paper,
  Popover,
  Portal,
  Radio,
  RadioGroup,
  Snackbar,
  Switch,
  Tab,
  Tabs,
  TextField,
  ThemeProvider,
  Tooltip,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import PropTypes from 'prop-types';
import {
  AccountCircle,
  Add, AddModerator, AdminPanelSettings, Article,
  AttachFile,
  AutoAwesome,
  Backup,
  BugReport, Code, Dashboard,
  Delete,
  Download,
  Keyboard,
  ExitToApp,
  Extension,
  KeyboardArrowDown,
  Folder, Forum, GridView, Group,
  Info, Insights, LibraryAdd, MoreVert,
  NewReleases,
  IntegrationInstructions,
  Publish,
  Save,
  Search,
  Settings,
  Upload, Edit, ChevronLeft, ChevronRight, Check
} from '@mui/icons-material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import UserManager from './UserManager';
import ProjectManager from './ProjectsManager';
import BlocklyWorkspace from './BlocklyWorkspace';
import { saveAs } from 'file-saver';
import { FileDrop } from 'react-file-drop';
import $ from 'jquery';
import QRCode from 'react-qr-code';
import firebase from 'firebase/compat';
import { LoadingButton } from '@mui/lab';

const generate = require('project-name-generator');

let BUILD_SERVER_URL = /*window.location.host === "localhost:3000" ? "http://localhost:8080" :*/ 'https://backend.rapidbuilder.tech';
let firebaseApp;
let isFirstTime = false;
const languages = [{ label: 'English', lang: 'en' }, { label: 'Arabic', lang: 'ar' }];
const androidSdks = [{
  label: 'Android 2.1 ( Api 7 )', api: 7
}, {
  label: 'Android 2.2.x ( Api 8 )', api: 8
}, {
  label: 'Android 2.3 - 2.3.2 ( Api 9 )', api: 9
}, {
  label: 'Android 2.3.3 - 2.3.7 ( Api 10 )', api: 10
}, {
  label: 'Android 3.0 ( Api 11 )', api: 11
}, {
  label: 'Android 3.1 ( Api 12 )', api: 12
}, {
  label: 'Android 3.2.x ( Api 13 )', api: 13
}, {
  label: 'Android 4.0.3 - 4.0.4 ( Api 15 )', api: 15
}, {
  label: 'Android 4.1.x ( Api 16 )', api: 16
}, {
  label: 'Android 4.2.x ( Api 17 )', api: 17
}, {
  label: 'Android 4.3.x ( Api 18 )', api: 18
}, {
  label: 'Android 4.4 - 4.4.4 ( Api 19 )', api: 19
}, {
  label: 'Android 5.0 ( Api 21 )', api: 21
}, {
  label: 'Android 5.1 ( Api 22 )', api: 22
}, {
  label: 'Android 6.0 ( Api 23 )', api: 23
}, {
  label: 'Android 7.0 ( Api 24 )', api: 24
}, {
  label: 'Android 7.1 ( Api 25 )', api: 25
}, {
  label: 'Android 8.0.0 ( Api 26 )', api: 26
}, {
  label: 'Android 8.1.0 ( Api 27 )', api: 27
}, {
  label: 'Android 9 ( Api 28 )', api: 28
}, {
  label: 'Android 10 ( Api 29 )', api: 29
}, {
  label: 'Android 11 ( Api 30 )', api: 30
},
  {
    label: 'Android 12 ( Api 31 )', api: 30
  },
  {
    label: 'Android 12 L ( Api 32 )', api: 32
  },
  {
    label: 'Android 13 ( Api 33 )', api: 33
  }];

class App extends React.Component {
  constructor(props) {
    super(props);
    const { t } = this.props;
    const sortByNameAscending = t('sort_by_name_ascending');
    const sortByNameDescending = t('sort_by_name_descending');
    const sortByCreatedAscending = t('sort_by_created_ascending');
    const sortByCreatedDescending = t('sort_by_created_descending');
    const sortByModifiedAscending = t('sort_by_modified_ascending');
    const sortByModifiedDescending = t('sort_by_modified_descending');
    this.sortByEnum = {
      NAME_ASCENDING: sortByNameAscending,
      NAME_DESCENDING: sortByNameDescending,
      DATE_CREATED_ASCENDING: sortByCreatedAscending,
      DATE_CREATED_DESCENDING: sortByCreatedDescending,
      DATE_MODIFIED_ASCENDING: sortByModifiedAscending,
      DATE_MODIFIED_DESCENDING: sortByModifiedDescending
    };
    this.state = {
      userAnchorEl: undefined,
      userOpen: false,
      aboutRapidDialogOpen: false,
      projectAnchorEl: undefined,
      projectOpen: false,
      buildAnchorEl: undefined,
      buildOpen: false,
      helpAnchorEl: undefined,
      pricingPlansDialogOpen: false,
      creatingCheckOut: undefined,
      blockEditorSideOpen: false,
      colorPickerAnchorEl: null,
      helpOpen: false,
      isLoading: true,
      snackbarMessage: undefined,
      projects: null,
      newProjectDialogOpen: false,
      newProjectDialogProjectName: '',
      newProjectDialogProjectPackageName: '',
      newProjectDialogProjectDescription: '',
      sessionExpiredDialog: false,
      userSettingsTheme: false,
      checkedProjects: [],
      currentProject: undefined,
      deleteProjectDialogOpen: false,
      importFileDialogOpen: false,
      fileSelected: undefined,
      fileSelectedName: '',
      fileSelectedDescription: '',
      buildingProject: false,
      projectBuiltDialogOpen: false,
      optionsDialogOpen: false,
      projectOptionsProjectName: undefined,
      projectOptionsProjectDescription: undefined,
      projectOptionsPackageName: undefined,
      projectOptionsVersionName: undefined,
      projectOptionsVersionNumber: undefined,
      keyboardShortcutsDialogOpen: false,
      projectOptionsHomeWebsite: undefined,
      projectOptionsIcon: undefined,
      projectOptionsIconBlob: undefined,
      userSettingsLanguage: undefined,
      projectOptionsMinSdk: undefined,
      userName: '',
      buildingStatus: '',
      email: '',
      projectOptionsTabValue: 'general',
      userSettingsTabValue: 'account',
      projectOptionsProguard: false,
      exportProjectDialogOpen: false,
      exportAsMultipleRadioChecked: false,
      exportAsZipRadioChecked: true,
      successSnackbarMessage: undefined,
      userPhotoBlob: "",
      errorSnackbarMessage: undefined,
      classesData: undefined,
      importClassDialogOpen: false,
      classesDataFiler: '',
      importLibraryDialogOpen: false,
      loadingProject: false,
      backupSelectedProjects: false,
      projectOptionsAndroidManifest: undefined,
      userSettingsDialogOpen: false,
      classesSideMenuOpen: false,
      userSettingsThemeColor: '#6200ee',
      userSettingsAutoload: true,
      sortBy: this.sortByEnum.DATE_MODIFIED_ASCENDING,
      sortMenuAnchorEl: null,
      sortMenuOpen: false,
      projectIconBlob: null,
      newProjectDialogProjectPackageNameAuto: true,
      importingClass: false,
      projectLibrariesBlob: [],
      adminDialogOpen: false,
      importLibraryGradleDependency: undefined,
      adminTabValue: 'dashboard',
      adminUsers: [],
      adminUserAnchorEl: null,
      adminUserOpen: false,
      adminUserSelected: undefined,
      updatePasswordDialogOpen: false,
      updatePasswordNewPassword: '',
      reauthenticationRequiredDialogOpen: false,
      reauthenticationDialogPassword: '',
      deleteAccountDialogOpen: false,
      userSettingsGridView: false,
      userSettingsSuppressWarnings: false,
      newVariableDialogOpen: false,
      newVariableDialogName: undefined,
      newVariableDialogType: undefined,
      projectBuildFailedDialog: false,
      projectOptionsAutoIncrement: false,
      projectErrors: []
    };
    this.currentProjectBlob = undefined;
    this.uploadProjectFileInput = null;
    this.setUserMenuAnchorEl = this.setUserMenuAnchorEl.bind(this);
    this.openUserMenu = this.openUserMenu.bind(this);
    this.doSortProjects = this.doSortProjects.bind(this);
    this.handleUserMenuClose = this.handleUserMenuClose.bind(this);
    this.handleOpenColorPicker = this.handleOpenColorPicker.bind(this);
    this.handleCloseColorPicker = this.handleCloseColorPicker.bind(this);
    this.handleSignOutClose = this.handleSignOutClose.bind(this);
    this.setProjectMenuAnchorEl = this.setProjectMenuAnchorEl.bind(this);
    this.handleProjectMenuClose = this.handleProjectMenuClose.bind(this);
    this.handleChangeComplete = this.handleChangeComplete.bind(this);
    this.openProjectMenu = this.openProjectMenu.bind(this);
    this.openBuildMenu = this.openBuildMenu.bind(this);
    this.handleBuildMenuClose = this.handleBuildMenuClose.bind(this);
    this.setBuildMenuAnchorEl = this.setBuildMenuAnchorEl.bind(this);
    this.handleUserSettingsClose = this.handleUserSettingsClose.bind(this);
    this.openHelpMenu = this.openHelpMenu.bind(this);
    this.openUploadFile = this.openUploadFile.bind(this);
    this.handleHelpMenuClose = this.handleHelpMenuClose.bind(this);
    this.setHelpMenuAnchorEl = this.setHelpMenuAnchorEl.bind(this);
    this.handleNewProjectDialogClose = this.handleNewProjectDialogClose.bind(this);
    this.doCreateNewProject = this.doCreateNewProject.bind(this);
    this.showSessionExpiredDialog = this.showSessionExpiredDialog.bind(this);
    this.setChecked = this.setChecked.bind(this);
    this.loadProjects = this.loadProjects.bind(this);
    this.doDeleteSelectedProjects = this.doDeleteSelectedProjects.bind(this);
    this.deleteProjects_ = this.deleteProjects_.bind(this)
    this.openProject = this.openProject.bind(this);
    this.handleMyProjectsMenuItem = this.handleMyProjectsMenuItem.bind(this);
    this.handleNewProjectMenuItem = this.handleNewProjectMenuItem.bind(this);
    this.handleBuildProjectMenuItem = this.handleBuildProjectMenuItem.bind(this);
    this.handleDeleteProjectMenuItem = this.handleDeleteProjectMenuItem.bind(this);
    this.handleCloseDeleteProjectDialog = this.handleCloseDeleteProjectDialog.bind(this);
    this.deleteProjects = this.deleteProjects.bind(this);
    this.handleExportProjectMenuItem = this.handleExportProjectMenuItem.bind(this);
    this.handleCloseImportFileDialog = this.handleCloseImportFileDialog.bind(this);
    this.openImportFileDialog = this.openImportFileDialog.bind(this);
    this.handleImportProjectMenuItem = this.handleImportProjectMenuItem.bind(this);
    this.processImportedFiles = this.processImportedFiles.bind(this);
    this.renderFileList = this.renderFileList.bind(this);
    this.handleSaveProjectMenuItem = this.handleSaveProjectMenuItem.bind(this);
    this.buildProject = this.buildProject.bind(this);
    this.resolveLibraries = this.resolveLibraries.bind(this);
    this.handleCloseProjectBuiltDialog = this.handleCloseProjectBuiltDialog.bind(this);
    this.handleCloseProjectOptionsDialog = this.handleCloseProjectOptionsDialog.bind(this);
    this.handleProjectOptionsMenuItem = this.handleProjectOptionsMenuItem.bind(this);
    this.handleSaveUserSettings = this.handleSaveUserSettings.bind(this);
    this.handleSaveProjectSettings = this.handleSaveProjectSettings.bind(this);
    this.projectSettingChanged = this.projectSettingChanged.bind(this);
    this.doExportSelectedProjects = this.doExportSelectedProjects.bind(this);
    this.handleChangeProjectOptionsTab = this.handleChangeProjectOptionsTab.bind(this);
    this.handleCloseExportProjectDialog = this.handleCloseExportProjectDialog.bind(this);
    this.handleCloseAboutRapidDialog = this.handleCloseAboutRapidDialog.bind(this);
    this.openExportProjectDialog = this.openExportProjectDialog.bind(this);
    this.openAboutRapidDialog = this.openAboutRapidDialog.bind(this);
    this.showSuccessSnackbar = this.showSuccessSnackbar.bind(this);
    this.setSortMenuAnchorEl = this.setSortMenuAnchorEl.bind(this);
    this.showErrorSnackbar = this.showErrorSnackbar.bind(this);
    this.handleCloseImportClassDialog = this.handleCloseImportClassDialog.bind(this);
    this.openImportClassDialog = this.openImportClassDialog.bind(this);
    this.openNewVariableDialog = this.openNewVariableDialog.bind(this);
    this.loadClassesData = this.loadClassesData.bind(this);
    this.loadClassInfo = this.loadClassInfo.bind(this);
    this.lastFetchedClassesNum = 0;
    window.top['openImportClassDialog'] = this.openImportClassDialog;
    window.document.onkeydown = (event) => {
      if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'n') {
        this.openNewProjectDialog();
      } else if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 's') {
        if (this.state.currentProject) {
          this.handleSaveProjectMenuItem();
        }
      } else if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'p') {
        if (this.state.currentProject) {
          this.handleMyProjectsMenuItem()
        }
      } else if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'i') {
        this.handleImportProjectMenuItem()
      } else if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'o') {
        if (this.state.currentProject) {
          this.openProjectOptionsDialog()
        }
      } else if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'u') {
        this.openUserSettingsDialog()
      } else if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'b') {
        if (this.state.currentProject) {
          this.handleBuildProjectMenuItem("debug")
        }
      } else if (event.ctrlKey && event.altKey && event.key.toLowerCase() === 'e') {
        if (this.state.currentProject) {
          this.handleExportProjectMenuItem()
        }
      }
    };
    const firebaseConfig = {
      apiKey: 'AIzaSyB4In0zDPYf1Zaxp7bSAkd7gB7sK95SaJc',
      authDomain: 'rapid-b9abe.firebaseapp.com',
      projectId: 'rapid-b9abe',
      storageBucket: 'rapid-b9abe.appspot.com',
      messagingSenderId: '92500374975',
      appId: '1:92500374975:web:7bc67ed995a03ded0b1d0a',
      measurementId: 'G-E4CTMSZK0K'
    };
    firebaseApp = firebase.initializeApp(firebaseConfig);
    console.log(firebaseApp);
    firebaseApp
      .auth()
      .onAuthStateChanged((user) => {
        if (user) {
          if (this.state.isLoading) {
            let data = this.state;
            data.isLoading = false;
            data.userName = user.displayName;
            data.email = user.email;
            this.setState(data);
            // resolve the user ID from the backend
            console.log(user);
            user
              .getIdTokenResult(true)
              .then((token_) => {
                let token = token_.token;
                this.admin = !!token_.claims.admin;
                this.plan = token_.claims.plan || "free";
                if (token_.claims.paymentFailed === true) {
                  this.showErrorSnackbar(t('monthly_payment_failed'))
                }
                this.userManager = new UserManager(user, token);
                if (!this.userId) {
                  this.userManager.resolveUserID((status) => {
                    if (status === 200) {
                      this.userId = this.userManager.getUserId();
                      console.log(this.userId);
                      if (this.userId && !this.state.userPhotoBlob) {
                        this.userManager.resolveImageURL((result) => {
                          i18next.changeLanguage(this.userManager.getUser().language).then();
                          const sortByNameAscending = t('sort_by_name_ascending');
                          const sortByNameDescending = t('sort_by_name_descending');
                          const sortByCreatedAscending = t('sort_by_created_ascending');
                          const sortByCreatedDescending = t('sort_by_created_descending');
                          const sortByModifiedAscending = t('sort_by_modified_ascending');
                          const sortByModifiedDescending = t('sort_by_modified_descending');
                          this.sortByEnum = {
                            NAME_ASCENDING: sortByNameAscending,
                            NAME_DESCENDING: sortByNameDescending,
                            DATE_CREATED_ASCENDING: sortByCreatedAscending,
                            DATE_CREATED_DESCENDING: sortByCreatedDescending,
                            DATE_MODIFIED_ASCENDING: sortByModifiedAscending,
                            DATE_MODIFIED_DESCENDING: sortByModifiedDescending
                          };
                          data = this.state;
                          data.userSettingsTheme = this.userManager.getUser().darkTheme;
                          data.userPhotoBlob = result;
                          data.userSettingsAutoload = this.userManager.getUser().autoload;
                          data.userSettingsThemeColor = this.userManager.getUser().themeColor;
                          data.userSettingsGridView = this.userManager.getUser().gridView;
                          data.userSettingsSuppressWarnings = this.userManager.getUser().suppressWarnings;
                          if (this.userManager.getUser().darkTheme) {
                            document.body.classList.add('DarkTheme');
                          }

                          this.setState(data);
                          this.projectManager = new ProjectManager(this.userManager.getUser(), token);
                          this.loadProjects();
                          console.log(this.state.userSettingsTheme);
                        })
                      } else {
                        this.showErrorSnackbar(t('user_not_exist'));
                      }
                    } else if (status === 429) {
                      this.showErrorSnackbar(t('backend_quota_exceeded'))
                    } else {
                      this.showErrorSnackbar(t('failed_to_fetch_user'));
                    }
                  });
                }
              });
          }
        } else {
          window.location.href = 'auth?callback=' + window.location.href;
        }
      });
  }


  updateCurrentProject() {
    const { t } = this.props;
    this.projectManager.loadProjectInformation(this.state.currentProject._id, (status, project) => {
      if (status === 200) {
        if (JSON.stringify(this.state.currentProject) !== JSON.stringify(project)) {
          if (this.state.currentProject.blocks !== project.blocks) {
            this.blocklyWorkspace.updateWorkspaceBlocks(project.blocks);
          }
          console.log(project);
          let data = this.state;
          data.currentProject = project;
          this.setState(data);
        }
      } else if (status === 401) {
        this.showSessionExpiredDialog()
      } else {
        this.showErrorSnackbar(t('project_update_failed'));
      }
    });
  }

  showSessionExpiredDialog() {
    let data = this.state;
    data.sessionExpiredDialog = true;
    this.setState(data)
  }

  loadProjects() {
    const { t } = this.props;
    this.projectManager.fetchProjects((status) => {
      if (status === 200) {
        if (this.projectManager.getProjects()) {
          if (!this.compareArrays(this.state.projects, this.projectManager.getProjects())) {
            const data = this.state;
            data.currentProject = undefined; // unload any existing project.
            this.setState(data, () => {
              if (this.projectToLoad) {
                this.openProject(this.projectToLoad);
                this.projectToLoad = undefined;
              } else {
                if (this.state.userSettingsAutoload) {
                  let sort = this.projectManager.getProjects().sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
                  if (sort[0]) {
                    this.openProject(sort[0]);
                  }
                }
              }
            });
            this.doSortProjects(this.projectManager.getProjects());
          }
        } else {
          this.showErrorSnackbar(t('project_fetch_failed'));
        }
      } else if (status === 401 ) {
        this.showSessionExpiredDialog()
      } else {
        this.showErrorSnackbar('Failed to fetch the projects from the backend server.');
      }
    });
  }

  compareArrays(a1, a2) {
    if (!a1 || !a2) {
      return false;
    }
    if (a1.length !== a2.length) {
      return false;
    }
    let i = a1.length;
    while (i--) {
      if (a2.includes(a1[i])) {
        return false;
      }
    }
    return true;
  }

  handleToggle(event, value) {
    event.stopPropagation();
    const currentIndex = this.state.checkedProjects.indexOf(value);
    const newChecked = [...this.state.checkedProjects];

    if (currentIndex === -1) {
      newChecked.push(value);
    } else {
      newChecked.splice(currentIndex, 1);
    }

    this.setChecked(newChecked);
  }

  setChecked(newChecked) {
    let data = this.state;
    data.checkedProjects = newChecked;
    this.setState(data);
  }

  openUserMenu(event) {
    this.setUserMenuAnchorEl(event.currentTarget);
  }

  setUserMenuAnchorEl(value) {
    if (value) {
      const data = this.state;
      data.userAnchorEl = value;
      data.userOpen = true;
      this.setState(data);
    }
  }

  handleProjectMenuClose() {
    const data = this.state;
    data.projectAnchorEl = undefined;
    data.projectOpen = false;
    this.setState(data);
  }

  openProjectMenu(event) {
    this.setProjectMenuAnchorEl(event.currentTarget);
  }

  setProjectMenuAnchorEl(value) {
    if (value) {
      const data = this.state;
      data.projectAnchorEl = value;
      data.projectOpen = true;
      this.setState(data);
    }
  }

  handleUserMenuClose() {
    const data = this.state;
    data.userAnchorEl = undefined;
    data.userOpen = false;
    this.setState(data);
  }

  openBuildMenu(event) {
    this.setBuildMenuAnchorEl(event.currentTarget);
  }

  openHelpMenu(event) {
    this.setHelpMenuAnchorEl(event.currentTarget);
  }

  setHelpMenuAnchorEl(value) {
    if (value) {
      const data = this.state;
      data.helpAnchorEl = value;
      data.helpOpen = true;
      this.setState(data);
    }
  }

  setBuildMenuAnchorEl(value) {
    if (value) {
      const data = this.state;
      data.buildAnchorEl = value;
      data.buildOpen = true;
      this.setState(data);
    }
  }

  handleBuildMenuClose() {
    const data = this.state;
    data.buildAnchorEl = undefined;
    data.buildOpen = false;
    this.setState(data);
  }

  handleHelpMenuClose() {
    const data = this.state;
    data.helpAnchorEl = undefined;
    data.helpOpen = false;
    this.setState(data);
  }

  handleSignOutClose() {
    firebaseApp.auth().signOut().then();
    this.handleUserMenuClose();
  }

  handleUserSettingsClose() {
    this.openUserSettingsDialog();
    this.handleUserMenuClose();
  }

  openNewProjectDialog() {
    const data = this.state;
    data.newProjectDialogOpen = true;
    data.newProjectDialogProjectName = "";
    data.newProjectDialogProjectPackageName = "";
    data.newProjectDialogProjectDescription = "";
    data.newProjectDialogProjectPackageNameAuto = true;
    this.setState(data);
  }

  handleCloseImportFileDialog() {
    const data = this.state;
    data.importFileDialogOpen = false;
    data.fileSelected = undefined;
    data.fileSelectedName = undefined;
    data.fileSelectedDescription = '';
    this.setState(data);
  }

  openImportFileDialog() {
    const data = this.state;
    data.importFileDialogOpen = true;
    this.setState(data);
  }

  handleCloseProjectOptionsDialog() {
    const data = this.state;
    data.optionsDialogOpen = false;
    this.setState(data);
  }

  handleCloseAboutRapidDialog() {
    const data = this.state;
    data.aboutRapidDialogOpen = false;
    this.setState(data);
  }

  handleCloseUserSettingsDialog() {
    const data = this.state;
    data.userSettingsDialogOpen = false;
    data.userSettingsTheme = this.userManager.getUser().darkTheme;
    data.userSettingsThemeColor = this.userManager.getUser().themeColor;
    data.userSettingsGridView = this.userManager.getUser().gridView;
    data.userSettingsSuppressWarnings = this.userManager.getUser().suppressWarnings;
    data.userName = this.userManager.getUser().name;
    if (data.userSettingsTheme) {
      document.body.classList.add('DarkTheme');
    } else {
      document.body.classList.remove('DarkTheme');
    }
    this.setState(data);
  }

  handleSaveUserSettings() {
    const { t } = this.props;
    let newUser = this.userManager.getUser();
    console.log(this.state.userSettingsLanguage.lang);
    console.log(this.userManager.getUser());
    if (this.state.userSettingsLanguage.lang !== this.userManager.getUser().language) {
      newUser.language = this.state.userSettingsLanguage.lang;
    }
    if (this.state.userSettingsTheme !== this.userManager.getUser().darkTheme) {
      newUser.darkTheme = this.state.userSettingsTheme;
    }
    if (this.state.userSettingsThemeColor !== this.userManager.getUser().themeColor) {
      newUser.themeColor = this.state.userSettingsThemeColor;
    }
    if (this.state.userSettingsAutoload !== this.userManager.getUser().autoload) {
      newUser.autoload = this.state.userSettingsAutoload;
    }
    if (this.state.userSettingsGridView !== this.userManager.getUser().gridView) {
      newUser.gridView = this.state.userSettingsGridView;
    }
    if (this.state.userSettingsSuppressWarnings !== this.userManager.getUser().suppressWarnings) {
      newUser.suppressWarnings = this.state.userSettingsSuppressWarnings;
    }
    if (this.state.userName !== this.userManager.getUser().name) {
      newUser.name = this.state.userName;
    }
    console.log(newUser);
    this.userManager.updateUser(newUser, (status) => {
      if (status === 200) {
        this.handleCloseUserSettingsDialog();
        this.showSuccessSnackbar(t('settings_updated'));
        window.location.reload();
      } else if (status === 401) {
        this.showSessionExpiredDialog()
      } else {
        this.showErrorSnackbar(t('setting_update_error'));
      }
    });
  }

  openUserSettingsDialog() {
    const data = this.state;
    data.userSettingsDialogOpen = true;
    console.log(this.userManager.getUser());
    data.userSettingsLanguage = this.userManager.getUser().language ? this.findLangObj(this.userManager.getUser().language) : {
      label: 'English', lang: 'en'
    };
    data.userSettingsTheme = this.userManager.getUser().darkTheme;
    data.userSettingsAutoload = this.userManager.getUser().autoload;
    data.userSettingsSuppressWarnings = this.userManager.getUser().suppressWarnings;
    this.setState(data);
  }

  findLangObj(lang) {
    for (var i in languages) {
      var langObj = languages[i];
      if (langObj.lang === lang) {
        return langObj;
      }
    }
    return null;
  }

  openAboutRapidDialog() {
    const data = this.state;
    data.aboutRapidDialogOpen = true;
    this.setState(data);
  }

  openProjectOptionsDialog() {
    const data = this.state;
    data.optionsDialogOpen = true;
    data.projectOptionsProjectName = this.state.currentProject.name;
    data.projectOptionsProjectDescription = this.state.currentProject.description.replaceAll('<br>', '\n');
    data.projectOptionsPackageName = this.state.currentProject.packageName;
    data.projectOptionsVersionName = this.state.currentProject.versionName;
    data.projectOptionsVersionNumber = this.state.currentProject.versionNumber;
    data.projectOptionsMinSdk = this.getObjectByApi(this.state.currentProject.minSdk);
    data.projectOptionsHomeWebsite = this.state.currentProject.homeWebsite;
    console.log(this.state.currentProject);
    data.projectOptionsProguard = this.state.currentProject.proguard;
    data.projectOptionsAutoIncrement = this.state.currentProject.autoIncrement;
    data.projectOptionsAndroidManifest = this.state.currentProject.androidManifest;
    data.projectOptionsIcon = this.state.currentProject.icon;
    data.projectOptionsIconBlob = this.state.projectIconBlob;
    this.setState(data);
  }

  renderUserMenu() {
    const { t } = this.props;
    return (<Menu
      id='fade-menu'
      anchorEl={this.state.userAnchorEl}
      anchorOrigin={{
        vertical: 'bottom', horizontal: 'center'
      }}
      transformOrigin={{
        vertical: 'top', horizontal: 'center'
      }}
      open={this.state.userOpen}
      onClose={this.handleUserMenuClose}
      autoFocus={false}
    >
      {this.admin ? (<MenuItem
        onClick={() => {
          let data = this.state;
          data.adminDialogOpen = true;
          this.setState(data);
          console.log(this.admin);
          this.userManager.loadUsers(1, (result, err) => {
            if (err) {
              let data = this.state;
              data.adminUsers = result;
              this.setState(data);
            } else {
              this.showErrorSnackbar(t('load_users_failed'));
            }
          });
        }}
      >
        <ListItemIcon>
          <AdminPanelSettings
            fontSize='small'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('admin')}
      </MenuItem>) : <div></div>}
      <MenuItem
        onClick={this.handleUserSettingsClose}
      >
        <ListItemIcon>
          <Settings
            fontSize='small'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('settings')}
      </MenuItem>
      <Divider />
      <MenuItem
        onClick={this.handleSignOutClose}
      >
        <ListItemIcon>
          <ExitToApp
            fontSize='small'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('logout')}
      </MenuItem>
    </Menu>);
  }

  handleBuildProjectMenuItem(type) {
    this.handleBuildMenuClose();
    this.buildProject(type);
  }

  renderBuildMenu() {
    const { t } = this.props;
    return (<Menu
      id='fade-menu'
      anchorEl={this.state.buildAnchorEl}
      anchorOrigin={{
        vertical: 'bottom', horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top', horizontal: 'left'
      }}
      open={this.state.buildOpen}
      onClose={this.handleBuildMenuClose}
    >
      <MenuItem
        onClick={() => this.handleBuildProjectMenuItem("debug")}
      >
        <ListItemIcon>
          <BugReport
            fontSize='medium'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('build_project_debug')}
      </MenuItem>
      <MenuItem
        onClick={() => this.handleBuildProjectMenuItem("release")}
      >
        <ListItemIcon>
          <NewReleases
            fontSize='medium'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('build_project_release')}
      </MenuItem>
    </Menu>);
  }

  renderHelpMenu() {
    const { t } = this.props;
    return (<Menu
      id='fade-menu'
      anchorEl={this.state.helpAnchorEl}
      anchorOrigin={{
        vertical: 'bottom', horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top', horizontal: 'left'
      }}
      open={this.state.helpOpen}
      onClose={this.handleHelpMenuClose}
    >
      <MenuItem
        onClick={() => {
          let data = this.state;
          data.helpOpen = false
          data.helpAnchorEl = null
          this.setState(data)
          window.open("https://docs.rapidbuilder.tech", "_blank")
        }}
      >
        <ListItemIcon>
          <Article
            fontSize='medium'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('documentation')}
      </MenuItem>
      <MenuItem
        onClick={() => {
          let data = this.state;
          data.helpOpen = false
          data.helpAnchorEl = null
          this.setState(data)
          window.open("https://community.rapidbuilder.com", "_blank")
        }}
      >
        <ListItemIcon>
          <Forum
            fontSize='medium'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('community')}
      </MenuItem>
      <MenuItem
        onClick={() => {
          let data = this.state;
          data.helpOpen = false
          data.helpAnchorEl = null
          this.setState(data)
          window.open("https://status.rapidbuilder.tech", "_blank")
        }}
      >
        <ListItemIcon>
          <Insights
            fontSize='medium'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        Status
      </MenuItem>
      <MenuItem
        onClick={() => {
          let data = this.state;
          data.helpOpen = false
          data.helpAnchorEl = null
          data.keyboardShortcutsDialogOpen = true
          this.setState(data)
        }}
      >
        <ListItemIcon>
          <Keyboard
            fontSize='medium'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('keyboard_shortcuts')}
      </MenuItem>
      <MenuItem
        onClick={this.openAboutRapidDialog}
      >
        <ListItemIcon>
          <Info
            fontSize='medium'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('about')}
      </MenuItem>
    </Menu>);
  }

  handleNewProjectMenuItem() {
    this.handleProjectMenuClose();
    this.openNewProjectDialog();
  }

  handleCloseDeleteProjectDialog(delete_) {
    let data = this.state;
    data.deleteProjectDialogOpen = false;
    this.setState(data);
    if (delete_) {
      if (this.state.backupSelectedProjects) {
        this.doExportSelectedProjects(true, true,  () => {
          this.deleteProjects_();
        });
      } else {
        this.deleteProjects_();
      }
    }
  }

  deleteProjects_() {
    const { t } = this.props;
    let data = this.state;
    const projectsToDelete = this.projectsToDelete;
    let project;
    for (let projectIndex in projectsToDelete) {

      project = projectsToDelete[projectIndex];
      // eslint-disable-next-line no-loop-func
      this.projectManager.deleteProject(project, (status) => {
        console.log(status);
        let successfulDeletes = 0;
        if (status === 401) {
          this.showSessionExpiredDialog()
          return;
        } else if (status !== 200) {
          this.showErrorSnackbar(t('project_delete_failed') + project.name);
          return;
        } else {
          successfulDeletes++;
        }
        console.log(successfulDeletes.length);
        console.log(projectsToDelete.length - 1);
        if (projectIndex >= projectsToDelete.length - 1) {
          if (successfulDeletes === projectsToDelete.length - 1) {
            this.showSuccessSnackbar(t('project_delete_success'));
          }
          if (this.blocklyWorkspace) {
            this.blocklyWorkspace.disposeBlocklyWorkspace();
            this.blocklyWorkspace = null;
          }
          data = this.state;
          data.projects = undefined;
          data.checkedProjects = [];
          data.currentProject = undefined;
          this.setState(data);
          this.loadProjects();
        }
      });
    }
  }

  deleteProjects(projects) {
    this.projectsToDelete = projects;
    // show delete projects dialog
    let data = this.state;
    data.deleteProjectDialogOpen = true;
    this.setState(data);
  }

  handleDeleteProjectMenuItem() {
    this.handleProjectMenuClose();
    this.deleteProjects([this.state.currentProject]);
  }

  handleExportProjectMenuItem() {
    this.handleProjectMenuClose();
    this.blocklyWorkspace.createProjectFile(this.state.currentProject, this.state.projectIconBlob, this.state.projectLibrariesBlob, (data) => {
      saveAs(data, this.state.currentProject['name'] + '.rbx');
    });
  }

  doExportSelectedProjects(opt_force, opt_zip, opt_callback) {
    opt_force = opt_force || false;
    opt_zip = opt_zip || false;
    opt_callback = opt_callback || function() {};
    if (this.state.checkedProjects.length > 1) {
      if (!opt_force) {
        this.openExportProjectDialog();
      } else {
        const zip = new JSZip();
        this.exportProjects(0, opt_zip, zip, opt_callback);
      }
    } else if (this.state.checkedProjects.length === 1) {
      let project_ = this.state.checkedProjects[0];
      this.openProject(project_, true, (project) => {
        this.blocklyWorkspace = new BlocklyWorkspace(project, this.state.projectIconBlob, this.state.projectLibrariesBlob, this.projectManager, this.userManager.getUser());
        this.blocklyWorkspace.createProjectFile(project, this.state.projectIconBlob, this.state.projectLibrariesBlob, (content, project) => {
          saveAs(content, `${project['name']}.rbx`);
          opt_callback();
        });
      });
    }
  }

  exportProjects(index, opt_zip, zip, callback) {
    const project_ = this.state.checkedProjects[index];
    this.openProject(project_, true, (project) => {
      console.log('Got project: ' + JSON.stringify(project));
      this.blocklyWorkspace = new BlocklyWorkspace(project, this.state.projectIconBlob, this.state.projectLibrariesBlob, this.projectManager, this.userManager.getUser());
      this.blocklyWorkspace.createProjectFile(project, this.state.projectIconBlob, this.state.projectLibrariesBlob, (content, project) => {
        console.log(content);
        if (opt_zip) {
          zip.file(`${project['name']}.rbx`, content);
          console.log(parseInt(index));
          console.log(this.state.checkedProjects.length);
          if (parseInt(index) + 1 === this.state.checkedProjects.length) {
            zip
              .generateAsync({
                type: 'blob'
              })
              .then((content) => {
                saveAs(content, 'projects.zip');
                callback();
              });
          }
        } else {
          saveAs(content, `${project['name']}.rbx`);
        }
      }, false);
      this.blocklyWorkspace.disposeBlocklyWorkspace();
      this.blocklyWorkspace = null;
      if (!(parseInt(index) + 1 === this.state.checkedProjects.length)) {
        this.exportProjects(index + 1, opt_zip, zip, callback);
      }
    });
  }

  openExportProjectDialog() {
    let data = this.state;
    data.exportProjectDialogOpen = true;
    data.exportAsMultipleRadioChecked = false;
    data.exportAsZipRadioChecked = true;
    this.setState(data);
  }

  handleImportProjectMenuItem() {
    this.handleProjectMenuClose();
    this.openImportFileDialog();
  }

  handleChangeProjectOptionsTab(event, value) {
    let data = this.state;
    data.projectOptionsTabValue = value;
    this.setState(data);
  }

  handleProjectOptionsMenuItem() {
    this.handleProjectMenuClose();
    this.openProjectOptionsDialog();
  }

  renderProjectMenu() {
    const { t } = this.props;
    return (<Menu
      id='fade-menu'
      anchorEl={this.state.projectAnchorEl}
      anchorOrigin={{
        vertical: 'bottom', horizontal: 'left'
      }}
      transformOrigin={{
        vertical: 'top', horizontal: 'left'
      }}
      open={this.state.projectOpen}
      onClose={this.handleProjectMenuClose}
    >
      <MenuItem
        onClick={this.handleMyProjectsMenuItem}
      >
        <ListItemIcon>
          <Folder
            fontSize='small'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('my_projects')}
      </MenuItem>
      <Divider />
      <MenuItem
        onClick={this.handleProjectOptionsMenuItem}
      >
        <ListItemIcon>
          <Settings
            fontSize='small'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('options')}
      </MenuItem>
      <Divider />
      <MenuItem
        onClick={this.handleNewProjectMenuItem}
      >
        <ListItemIcon>
          <Add
            style={{ fill: 'black' }}
            fontSize='small'
          />
        </ListItemIcon>
        <ListItemText>
          {t('new_project')}
        </ListItemText>
      </MenuItem>
      <MenuItem
        onClick={this.handleSaveProjectMenuItem}
      >
        <ListItemIcon>
          <Save
            fontSize='small'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('save_project')}
      </MenuItem>
      <MenuItem
        onClick={this.handleDeleteProjectMenuItem}
      >
        <ListItemIcon>
          <Delete
            style={{ fill: 'black' }}
            fontSize='small'
          />
        </ListItemIcon>
        {t('delete_project')}
      </MenuItem>
      <MenuItem
        onClick={this.handleImportProjectMenuItem}
      >
        <ListItemIcon>
          <Upload
            fontSize='small'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('import_project')}
      </MenuItem>
      <MenuItem
        onClick={this.handleExportProjectMenuItem}
      >
        <ListItemIcon>
          <Download
            fontSize='small'
            style={{ fill: 'black' }}
          />
        </ListItemIcon>
        {t('export_project')}
      </MenuItem>
    </Menu>);
  }

  render() {
    const { t } = this.props;
    this.theme = createTheme({
      palette: {
        mode: this.state.userSettingsTheme ? 'dark' : 'light', primary: {
          main: this.state.userSettingsThemeColor
        }
      },

    });
    return !this.state.isLoading ? (<ThemeProvider theme={this.theme}>
      <Paper
        style={{ minHeight: '100vh' }}
      >
        <div className='App'>
          <div id='project-building-popup'>
            <CircularProgress />
            <p id='building-popup-label'>
              Building Test..
            </p>
          </div>
          <table
            style={{ width: '100%' }}
          >
            <tbody>
            <tr>
              <td
                style={{
                  width: '1px'
                }}
              >
                <div
                  style={{
                    width: '70px',
                    height: '70px',
                    marginTop: '10px',
                    WebkitMask: 'url(' + logo + ') center/contain',
                    mask: logo,
                    background: this.state.userSettingsThemeColor
                  }}
                  alt={'logo'}
                  class={'logo'}
                />
              </td>
              <td><h2 style={{
                textAlign: "left",
                marginTop: '26px',
                color: this.state.userSettingsThemeColor
              }}>Rapid</h2></td>
              <Dialog
                open={this.state.importFileDialogOpen}
                onClose={this.handleCloseImportFileDialog}
                maxWidth={'md'}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
              >
                <DialogTitle id='alert-dialog-title'>
                  {t('import_project')}
                </DialogTitle>
                <DialogContent
                  dividers
                  style={{
                    width: '645px', height: '250px'
                  }}
                >
                  <FileDrop
                    onDrop={(files) => this.processImportedFiles(files)}
                  >
                    {t('drag_drop_rbx')}
                    <p
                      style={{
                        textAlign: 'center'
                      }}
                    >
                      Or
                    </p>
                    <input
                      accept='.rbx'
                      id='file-upload-btn'
                      style={{
                        display: 'none'
                      }}
                      type='file'
                      onChange={(e) => this.processImportedFiles(e.target.files)}
                    />
                    <label
                      htmlFor='file-upload-btn'
                      style={{
                        textAlign: 'center',
                        display: 'block',
                        color: this.state.userSettingsThemeColor,
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {t('browse_to_upload')}
                    </label>
                  </FileDrop>
                  <List
                    sx={{
                      marginTop: '55px', width: '100%', bgcolor: 'background.paper'
                    }}
                  >
                    {this.renderFileList()}
                  </List>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={this.handleCloseImportFileDialog}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={() => this.processImportedFiles(this.state.fileSelected, true)}
                    autoFocus
                    disabled={!this.state.fileSelected}
                  >
                    {t('import')}
                  </Button>
                </DialogActions>
              </Dialog>
              <Dialog
                open={this.state.importLibraryDialogOpen}
                onClose={() => {
                  let data = this.state;
                  data.importLibraryDialogOpen = true;
                  this.setState(data);
                }}
                maxWidth={'md'}
                aria-labelledby='alert-dialog-title'
                aria-describedby='alert-dialog-description'
              >
                <DialogTitle id='alert-dialog-title'>
                  {t('import_library')}
                </DialogTitle>
                <DialogContent
                  dividers
                  style={{
                    width: '645px', height: '250px'
                  }}
                >
                  <FileDrop
                    onDrop={(files) => this.processImportedLibraries(files)}
                  >
                    {t('drag_drop_jar')}
                    <p
                      style={{
                        textAlign: 'center'
                      }}
                    >
                      {t('or')}
                    </p>
                    <input
                      accept='.jar'
                      id='file-upload-btn'
                      style={{
                        display: 'none'
                      }}
                      type='file'
                      onChange={(e) => this.processImportedLibraries(e.target.files)}
                    />
                    <label
                      htmlFor='file-upload-btn'
                      style={{
                        textAlign: 'center',
                        display: 'block',
                        color: this.state.userSettingsThemeColor,
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      {t('browse_to_upload')}
                    </label>
                  </FileDrop>
                  <List
                    sx={{
                      marginTop: '55px', width: '100%', bgcolor: 'background.paper'
                    }}
                  >
                    {this.renderFileList()}
                  </List>
                  <Divider>{t('or')}</Divider>
                  <div style={{textAlign: "center"}}>
                  <p>{t('import_using_maven')}</p>
                  <TextField value={this.state.importLibraryGradleDependency} onChange={(e) =>{
                    let data = this.state;
                    data.importLibraryGradleDependency = e.target.value;
                    this.setState(data)
                  }} fullWidth  id="outlined-basic" label={t('gradle_dependency')} variant="outlined" helperText={"Imports the given library the following maven library including all of its dependencies to your extension. The structure for the dependency is: group-id:artifact-id:type:version. For example: androidx.camera:camera-view:aar:1.2.0-beta02"} />
                  </div>
                </DialogContent>
                <DialogActions>
                  <Button
                    onClick={() => {
                      let data = this.state;
                      data.importLibraryDialogOpen = false;
                      this.setState(data);
                    }}
                  >
                    {t('cancel')}
                  </Button>
                  <Button
                    onClick={() => {
                      let data = this.state;
                      data.importLibraryDialogOpen = false;
                      this.setState(data);
                      if (this.state.fileSelected) {
                        this.processImportedLibraries(this.state.fileSelected, true)
                      } else if (this.state.importLibraryGradleDependency && this.state.importLibraryGradleDependency.length) {
                        this.resolveLibraries(this.state.importLibraryGradleDependency)
                      }}
                    }
                    autoFocus
                    disabled={!this.state.fileSelected && !this.state.importLibraryGradleDependency}
                  >
                    {t('import')}
                  </Button>
                </DialogActions>
              </Dialog>
              {this.renderProjectMenu()}
              {this.renderBuildMenu()}
              {this.renderHelpMenu()}
              <td
                id='project-toolbar'
                style={this.state.currentProject ? {
                  display: 'block'
                } : {
                  display: 'none'
                }}
              >
                <Button
                  variant='outlined'
                  id={'file-button'}
                  className='toolbar-button'
                  color={'primary'}
                  onClick={this.openProjectMenu}
                  endIcon={<KeyboardArrowDown />}
                >
                  {t('project')}
                </Button>
                <Button
                  variant='outlined'
                  id={'build-button'}
                  className='toolbar-button'
                  color={'primary'}
                  onClick={this.openBuildMenu}
                  endIcon={<KeyboardArrowDown />}
                >
                  {t('build')}
                </Button>
                <Button
                  variant='outlined'
                  id={'help-button'}
                  className='toolbar-button'
                  color={'primary'}
                  onClick={this.openHelpMenu}
                  endIcon={<KeyboardArrowDown />}
                >
                  {t('help')}
                </Button>
              </td>
              <div>
              <td
                style={{
                  float: 'right'
                }}
              >
                {this.renderUserMenu()}
                <Avatar
                  onClick={this.openUserMenu}
                  alt={this.state.userName}
                  src={this.state.userPhotoBlob ? this.state.userPhotoBlob : ""}
                  sx={{
                    width: 50, height: 50, background: this.state.userPhotoBlob && this.state.userPhotoBlob.length ? "transparent" : "linear-gradient(-180deg, " + hexToRgb(this.state.userSettingsThemeColor) + " 0%, " + hexToRgb(shadeColor(this.state.userSettingsThemeColor, -40)) + " 85%)"
                  }}
                  style={{
                    marginBottom: '10px', marginTop: '24px', marginRight: '10px'
                  }}
                />
              </td>

              <td
                style={{
                  float: 'right',
                  marginTop: "25px",
                  marginRight: "10px"
                }}
              >
                <Tooltip title="Docs">
                <IconButton size="large" onClick={() => window.open("https://docs.rapidbuilder.tech", "_blank")}>
                  <Article fontSize={"inherit"}/>
                </IconButton>
                </Tooltip>
              </td>
                <td
                  style={{
                    float: 'right',
                    marginTop: "25px",
                    marginRight: "10px"
                  }}
                >
                  <Tooltip title="Status">
                  <IconButton size="large" onClick={() => window.open("https://status.rapidbuilder.tech", "_blank")}>
                    <Insights fontSize={"inherit"}/>
                  </IconButton>
                  </Tooltip>
                </td>
                <td
                  style={{
                    float: 'right',
                    marginTop: "25px",
                    marginRight: "10px"
                  }}
                >
                  <Tooltip title="Community">
                  <IconButton size="large" onClick={() => window.open("https://community.rapidbuilder.tech", "_blank")}>
                    <Forum fontSize={"inherit"}/>
                  </IconButton>
                  </Tooltip>
                </td>
                <td
                  style={{
                    float: 'right',
                    marginTop: "25px",
                    marginRight: "10px",
                    display: this.state.currentProject ? "initial" : "none"
                  }}
                >
                  <Tooltip title="My Projects">
                  <IconButton size="large" onClick={this.handleMyProjectsMenuItem}>
                    <Folder fontSize={"inherit"}/>
                  </IconButton>
                  </Tooltip>
                </td>
            </div>
            </tr>
            </tbody>
          </table>
          <div
            style={(!this.state.checkedProjects || this.state.checkedProjects.length === 0) && !this.state.currentProject && this.projectManager ? {
              display: 'flex', alignItems: 'center', margin: '10px'
            } : { display: 'none' }}
            id={'projectsControls'}
          >
            <Button
              variant='outlined'
              className='toolbar-button'
              onClick={() => this.openNewProjectDialog()}
              id={'project-controls-new-project-button'}
              color={'primary'}
              startIcon={<Add />}
            >
              {t('new_project')}
            </Button>
            <Button
              onClick={this.openImportFileDialog}
              variant='outlined'
              className='toolbar-button'
              id={'project-controls-import-project-button'}
              color={'primary'}
              startIcon={<Backup />}
            >
              {t('import_project')}
            </Button>
            <Button
              variant='outlined'
              className='toolbar-button'
              onClick={(e) => this.setSortMenuAnchorEl(e.currentTarget, null)}
              id={'project-controls-import-project-button'}
              color={'primary'}
            >
              {this.state.sortBy + '▾'}
            </Button>
            <Menu
              id='basic-menu'
              anchorEl={this.state.sortMenuAnchorEl}
              open={this.state.sortMenuOpen}
              onClose={() => this.setSortMenuAnchorEl(null, null)}
            >
              <MenuItem
                onClick={() => this.setSortMenuAnchorEl(null, this.sortByEnum.NAME_ASCENDING)}>{this.sortByEnum.NAME_ASCENDING}</MenuItem>
              <MenuItem
                onClick={() => this.setSortMenuAnchorEl(null, this.sortByEnum.NAME_DESCENDING)}>{this.sortByEnum.NAME_DESCENDING}</MenuItem>
              <MenuItem
                onClick={() => this.setSortMenuAnchorEl(null, this.sortByEnum.DATE_CREATED_ASCENDING)}>{this.sortByEnum.DATE_CREATED_ASCENDING}</MenuItem>
              <MenuItem
                onClick={() => this.setSortMenuAnchorEl(null, this.sortByEnum.DATE_CREATED_DESCENDING)}>{this.sortByEnum.DATE_CREATED_DESCENDING}</MenuItem>
              <MenuItem
                onClick={() => this.setSortMenuAnchorEl(null, this.sortByEnum.DATE_MODIFIED_ASCENDING)}>{this.sortByEnum.DATE_MODIFIED_ASCENDING}</MenuItem>
              <MenuItem
                onClick={() => this.setSortMenuAnchorEl(null, this.sortByEnum.DATE_MODIFIED_DESCENDING)}>{this.sortByEnum.DATE_MODIFIED_DESCENDING}</MenuItem>
            </Menu>
          </div>
          <div
            style={!this.state.checkedProjects || this.state.checkedProjects.length === 0 || this.state.currentProject ? { display: 'none' } : {
              display: 'flex', alignItems: 'center', margin: '10px'
            }}
            id={'selectedProjectsControls'}
          >
            <Button
              variant='outlined'
              className='toolbar-button'
              onClick={() => this.doDeleteSelectedProjects()}
              id={'selected-project-controls-delete-project-button'}
              color={'primary'}
              startIcon={<Delete />}
            >
              {t('delete_project')}
            </Button>
            <Button
              onClick={() => this.doExportSelectedProjects()}
              variant='outlined'
              className='toolbar-button'
              id={'selected-project-controls-export-project-button'}
              color={'primary'}
              startIcon={<Download />}
            >
              {' '}
              {t('export_project')}
            </Button>
          </div>
          {this.renderProjectsView()}
          <table
            id={'project-view-table'}
            style={this.state.currentProject ? { display: 'table' } : { display: 'none' }}
          >
            <tbody>
            <tr
              id={'project-view-tr'}
              style={{height: "100%"}}
            >
              <td>
                <div style={{width:  this.state.blockEditorSideOpen ? "420px" : "75px",borderTopColor: "#ebebeb", borderTopStyle: "solid", borderTopWidth: "1px", marginLeft: "4px", textAlign: "left"}}>
                  <div style={{display: "inline-flex", alignItems: "center", marginTop: "22px",borderBottom: "solid 1px lightgray", width: "100%", paddingBottom: "10px",flexDirection: this.state.blockEditorSideOpen ? "row" : "column", paddingLeft: this.state.blockEditorSideOpen ? "10px": "0px"}}>
                    <IntegrationInstructions
                      style={{
                        verticalAlign: 'middle'
                      }}
                    />
                  <Typography style={{marginLeft: "10px", display: this.state.blockEditorSideOpen ? "block" : "none"}} variant="h5">Classes</Typography>
                  </div>
                {this.state.currentProject && this.state.currentProject.classes ? (this.state.currentProject.classes.length === 0 ?
                  (<div style={{textAlign: "center"}}>
                    {this.state.blockEditorSideOpen ? (
                      <div>
                    <Lottie
                      loop
                      animationData={librariesLottieJson}
                      play
                      style={{
                        height: 250, marginBottom: '-51px'
                      }}
                    />
                    <h3>{t('no_classes_imported')}</h3>
                    <Button startIcon={<Upload/>} variant={"outlined"} onClick={() => {
                      let data = this.state;
                      data.importClassDialogOpen = true;
                      this.setState(data);
                    }}>{t('import_classes')}</Button>
                      </div>) : (
                        <IconButton style={{marginTop: "10px"}} onClick={() => {
                          let data = this.state;
                          data.importClassDialogOpen = true;
                          this.setState(data);
                        }}>
                      <Avatar
                      >
                      <Add/>
                      </Avatar>
                        </IconButton>
                    )}
                  </div>) : (<div style={{textAlign: "center"}}>
                    <List dense={false} style={{overflow: "clip scroll", scrollbarWidth: "thin", height: "calc(100vh - 325px)"}}>
                      {this.state.currentProject.classes.map((library) =>
                        <ListItem
                          style={{height: "80px"}}
                          secondaryAction={
                            <Tooltip title="Delete">
                              <IconButton style={{display: this.state.blockEditorSideOpen ? "block" : "none"}} edge="end" aria-label="delete" onClick={() => {
                                let data = this.state;
                                let newProject = this.state.currentProject;
                                newProject.classes.splice(this.state.currentProject.classes.indexOf(library), 1)
                                data.currentProject= newProject;
                                this.setState(data);
                                this.projectManager.updateProject(newProject, this.state.projectIconBlob, this.blocklyWorkspace, this.state.projectLibrariesBlob, (status) => {
                                  if (status === 200) {
                                    this.showSuccessSnackbar(t('class_delete_success'));
                                    this.blocklyWorkspace.project = newProject;
                                    this.blocklyWorkspace.updateToolboxCategories();
                                  } else if (status === 413) {
                                    this.showErrorSnackbar(t('class_storage_limit_exceeded'))
                                  } else {
                                    this.showErrorSnackbar(t('class_delete_failed'))
                                  }
                                })
                              }
                              }>
                                <Delete />
                              </IconButton>
                            </Tooltip>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar
                              sx={{
                                background: "linear-gradient(-180deg, " + hexToRgb(getColorByClassType(library.type)) + " 0%, " + hexToRgb(shadeColor(getColorByClassType(library.type), -40)) + " 85%)"
                              }}
                            >
                              {library.type === 'class' ? 'C' : library.type === 'interface' ? 'I' : 'E'}
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={<p style={{whiteSpace: "nowrap", overflow: "hidden",textOverflow: "ellipsis"}}>{library.displayName}</p>}
                            secondary={<p style={{whiteSpace: "nowrap", overflow: "hidden",textOverflow: "ellipsis"}}>{library.name}</p>}
                          />
                        </ListItem>,
                      )}
                      <IconButton style={{marginTop: "10px", display: !this.state.blockEditorSideOpen ? "inline-flex" : "none"}} onClick={() => {
                        let data = this.state;
                        data.importClassDialogOpen = true;
                        this.setState(data);
                      }}>
                        <Avatar
                        >
                          <Add/>
                        </Avatar>
                      </IconButton>
                    </List>
                    <Button style={{display: this.state.blockEditorSideOpen ? "inline-flex" : "none"}} startIcon={<Upload/>} variant={"outlined"} onClick={() => {
                      let data = this.state;
                      data.importClassDialogOpen = true;
                      this.setState(data);
                    }}>{t('import_classes')}</Button>
                  </div>)) : <div></div>}
                  <Divider style={{marginTop: "20px", marginBottom: "10px"}} />
                  <div style={{textAlign: "right"}}>
                    <IconButton size={"large"} onClick={() => {
                      let data = this.state;
                      data.blockEditorSideOpen = !data.blockEditorSideOpen;
                      this.setState(data, () => {
                        this.blocklyWorkspace.workspace.resize()
                      });
                      console.log(this.blocklyWorkspace.workspace)
                      console.log(this.blocklyWorkspace.workspace.getToolbox())
                    }}>
                      {this.state.blockEditorSideOpen ? <ChevronLeft /> : <ChevronRight />}
                    </IconButton>
                  </div>
                </div>
              </td>
              <td
                id={'project-view'}
                style={{height: "calc(100vh - 95px)", position: "absolute", width: "100%"}}
              >
                {/*The blockly workspace is injected here at runtime*/}
              </td>
            </tr>
            </tbody>
          </table>
          <Dialog
            open={this.state.newProjectDialogOpen}
            onClose={this.handleNewProjectDialogClose}
            aria-labelledby='responsive-dialog-title'
          >
            <DialogTitle id='responsive-dialog-title'>
              {t('create_new_project')}
            </DialogTitle>
            <DialogContent dividers>
              <TextField
                fullWidth
                onChange={(e) => {
                  const data = this.state;
                  data.newProjectDialogProjectName = e.target.value;
                  if (this.state.newProjectDialogProjectPackageNameAuto) {
                    data.newProjectDialogProjectPackageName = "com." + firebase.auth().currentUser.displayName.toLowerCase().replaceAll(" ", "") + "." + e.target.value.toString().toLowerCase();
                  }
                  this.setState(data);
                }}
                value={this.state.newProjectDialogProjectName}
                InputProps={{
                  endAdornment: (<InputAdornment position='end'>
                    <Tooltip title='Generate Project Name'>
                      <IconButton
                        onClick={() => {
                          const rawProjectName = generate().raw;
                          // convert the row project name into UpperCamelCase
                          let finalProjectName = '';
                          for (let index in rawProjectName) {
                            finalProjectName += rawProjectName[index]
                              .charAt(0)
                              .toUpperCase() + rawProjectName[index].substring(1, rawProjectName[index].length);
                          }
                          const data = this.state;
                          data.newProjectDialogProjectName = finalProjectName;
                          if (this.state.newProjectDialogProjectPackageNameAuto) {
                            data.newProjectDialogProjectPackageName = "com.rapid." + firebase.auth().currentUser.displayName.toLowerCase().replaceAll(" ", "") + "." + finalProjectName.toLowerCase();
                          }
                          this.setState(data);
                        }}
                        edge='end'
                      >
                        <AutoAwesome />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>)
                }}
                error={this.state.newProjectDialogProjectName.length > 0 && !this.isClassNameValid(this.state.newProjectDialogProjectName)}
                required
                label={t('name')}
                variant='outlined'
                helperText={t('project_name_helper')}
                style={{
                  marginTop: '10px', marginBottom: '20px'
                }}
              />
              <Divider />
              <TextField
                onChange={(e) => {
                  const data = this.state;
                  data.newProjectDialogProjectPackageName = e.target.value;
                  if (e.isTrusted) {
                    data.newProjectDialogProjectPackageNameAuto = false;
                  }
                  this.setState(data);
                }}
                value={this.state.newProjectDialogProjectPackageName}
                fullWidth
                required
                label={t('package_name')}
                variant='outlined'
                helperText={t('project_package_name_helper')}
                style={{
                  marginTop: '20px', marginBottom: '20px'
                }}
              />
              <Divider />
              <TextField
                onChange={(e) => {
                  const data = this.state;
                  data.newProjectDialogProjectDescription = e.target.value;
                  this.setState(data);
                }}
                fullWidth
                multiline
                label={t('helper_text')}
                variant='outlined'
                helperText={t('helper_text_helper')}
                style={{
                  marginTop: '20px'
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.handleNewProjectDialogClose}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={this.doCreateNewProject}
              >
                {t('create')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.updatePasswordDialogOpen}
            onClose={() => {
              let data = this.state;
              data.updatePasswordDialogOpen = false;
              this.setState(data);
            }}
            aria-labelledby='responsive-dialog-title'
          >
            <DialogTitle id='responsive-dialog-title'>
              {t('update_password')}
            </DialogTitle>
            <DialogContent dividers>
              <TextField
                fullWidth
                onChange={(e) => {
                  const data = this.state;
                  data.updatePasswordNewPassword = e.target.value;
                  this.setState(data);
                }}
                value={this.state.updatePasswordNewPassword}
                required
                type={'password'}
                label={t('password')}
                variant='outlined'
                helperText={t('password_help')}
                style={{
                  marginTop: '10px', marginBottom: '20px'
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  let data = this.state;
                  data.updatePasswordDialogOpen = false;
                  this.setState(data);
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => {
                  firebase.auth().currentUser.updatePassword(this.state.updatePasswordNewPassword).then(() => {
                    this.showSuccessSnackbar(t('password_update_success'));
                    let data = this.state;
                    data.updatePasswordDialogOpen = false;
                    this.setState(data);
                  }).catch((e) => {
                    console.log(e.code);
                    if (e.code === 'auth/requires-recent-login') {
                      this.showSnackbar(t('reauth_required'));
                      let data = this.state;
                      data.reauthenticationRequiredDialogOpen = true;
                      this.setState(data);
                    } else {
                      this.showErrorSnackbar(e.message);
                    }
                  });
                }}
              >
                {t('update')}
              </Button>
            </DialogActions>
          </Dialog>

          <Dialog
            open={this.state.deleteAccountDialogOpen}
            onClose={() => {
              let data = this.state;
              data.deleteAccountDialogOpen = false;
              this.setState(data);
            }}
            aria-labelledby='responsive-dialog-title'
          >
            <DialogTitle id='responsive-dialog-title'>
              {t('delete_account')}
            </DialogTitle>
            <DialogContent dividers>
              <DialogContentText id='alert-dialog-description'>
                {t('delete_account_helper')}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  let data = this.state;
                  data.deleteAccountDialogOpen = false;
                  this.setState(data);
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => {
                  firebase.auth().currentUser.delete().then(() => {
                    this.showSuccessSnackbar(t('user_delete_success'));
                    let data = this.state;
                    data.deleteAccountDialogOpen = false;
                    this.setState(data);
                  }).catch((e) => {
                    console.log(e.code);
                    if (e.code === 'auth/requires-recent-login') {
                      this.showSnackbar(t('reauth_required'));
                      let data = this.state;
                      data.reauthenticationRequiredDialogOpen = true;
                      this.setState(data);
                    } else {
                      this.showErrorSnackbar(e.message);
                    }
                  });
                }}
              >
                {t('delete')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            maxWidth={'md'}
            open={this.state.pricingPlansDialogOpen}
            onClose={() => {
              let data = this.state;
              data.pricingPlansDialogOpen = false;
              this.setState(data);
            }}
            aria-labelledby='responsive-dialog-title'
          >
            <DialogTitle id='responsive-dialog-title'>
              Pricing Plans
            </DialogTitle>
            <DialogContent dividers>
              <div style={{display: "flex", width:1110, alignItems: "stretch"}}>
                  <Card className={"pricing-plan"} style={{position: "relative"}}><div style={{display: "flex", alignItems:" center"}}><h1>Free</h1></div><p>
                  <ul className="pricing-table-features list-reset text-xs">
                    <li>
                      <span>20 Projects Per Account</span>
                    </li>
                    <li>
                      <span>5MB of Cloud Storage</span>
                    </li>
                    <li>
                      <span>10 BuildServer Requests Per Hour</span>
                    </li>
                    <li>
                      <span>Predefined Package Name</span>
                    </li>
                    <li>
                      <span>Community Support</span>
                    </li>
                    <li>
                      <span>Commercial Usage Not Allowed</span>
                    </li>
                  </ul></p>
                    <div style={{height: "100%"}}></div>
                    {this.renderSubscribeButton("free")}</Card>
                <Card className={"pricing-plan"} style={{position: "relative"}}><div style={{display: "flex", alignItems:" center"}}><h1>2$</h1><small>/month</small></div><p>
                  <ul className="pricing-table-features list-reset text-xs">
                    <li>
                      <span>30 Projects Per Account</span>
                    </li>
                    <li>
                      <span>10MB of Cloud Storage</span>
                    </li>
                    <li>
                      <span>15 BuildServer Requests Per Hour</span>
                    </li>
                    <li>
                      <span>Maven Dependency Resolution</span>
                    </li>
                  </ul></p><div style={{height: "100%"}}></div>{this.renderSubscribeButton("basic")}</Card>
                  <Card className={"pricing-plan"} style={{position: "relative"}}><div style={{display: "flex", alignItems:" center"}}><h1>5$</h1><small>/month</small></div><p>
                  <ul className="pricing-table-features list-reset text-xs">
                    <li>
                      <span>50 Projects</span>
                    </li>
                    <li>
                      <span>15MB of Cloud Storage</span>
                    </li>
                    <li>
                      <span>Private Support</span>
                    </li>
                    <li>
                      <span>20 BuildServer Requests Per Hour</span>
                    </li>
                    <li>
                      <span>Custom Package Names</span>
                    </li>
                    <li>
                      <span>Extension Analytics & Advanced Protection</span>
                    </li>
                    <li>
                      <span>ALL Features Of Other Paid Plans</span>
                    </li>
                  </ul></p><div style={{height: "100%"}}></div>{this.renderSubscribeButton("professional")}</Card>
                <Card  className={"pricing-plan"} style={{position: "relative"}}><div style={{display: "flex", alignItems:" center"}}><h1>8$</h1><small>/month</small></div><p>
                  <ul className="pricing-table-features list-reset text-xs">
                    <li>
                      <span>Unlimited Projects</span>
                    </li>
                    <li>
                      <span>50MB of Cloud Storage</span>
                    </li>
                    <li>
                      <span>High Priority Support</span>
                    </li>
                    <li>
                      <span>30 BuildServer Requests Per Hour</span>
                    </li>
                    <li>
                      <span>ALL Features Of Other Paid Plans</span>
                    </li>
                  </ul></p><div style={{height: "100%"}}></div>{this.renderSubscribeButton("premium")}</Card>
                <Card  className={"pricing-plan"} style={{position: "relative"}}><div style={{display: "flex", alignItems:" center"}}><h1>20$</h1><small>/month</small></div><p>
                  <ul className="pricing-table-features list-reset text-xs">
                    <li>
                      <span>Unlimited Projects</span>
                    </li>
                    <li>
                      <span>Unlimited Cloud Storage</span>
                    </li>
                    <li>
                      <span>High Priority Support</span>
                    </li>
                    <li>
                      <span>Unlimited BuildServer Requests</span>
                    </li>
                    <li>
                      <span>ALL Features Of Other Paid Plans</span>
                    </li>
                  </ul></p><div style={{height: "100%"}}></div>{this.renderSubscribeButton("enterprise")}</Card>
              </div>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  let data = this.state;
                  data.pricingPlansDialogOpen = false;
                  this.setState(data);
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.sessionExpiredDialog}
            dism
            aria-labelledby='responsive-dialog-title'
          >
            <DialogTitle id='responsive-dialog-title'>
              Session Expired
            </DialogTitle>
            <DialogContent dividers>
              <DialogContentText id='alert-dialog-description'>
                Your session has expired. Please reload this website in order to continue using Rapid.
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  window.location.reload()
                }}
              >
                Reload
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.keyboardShortcutsDialogOpen}
            dism
            fullWidth
            onClose={() => {
              let data = this.state;
              data.keyboardShortcutsDialogOpen = false;
              this.setState(data);
            }}
            aria-labelledby='responsive-dialog-title'
          >
            <DialogTitle id='responsive-dialog-title'>
              Keyboard Shortcuts
            </DialogTitle>
            <DialogContent dividers >
              <MenuItem>
                <ListItemIcon>
                  <Folder fontSize="small" />
                </ListItemIcon>
                <ListItemText>My Projects</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  Ctrl + Alt + P
                </Typography>
              </MenuItem>
              <Divider/>
              <MenuItem>
                <ListItemIcon>
                  <Add fontSize="small" />
                </ListItemIcon>
                <ListItemText>New Project</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  Ctrl + Alt + N
                </Typography>
              </MenuItem>
              <Divider/>
              <MenuItem>
                <ListItemIcon>
                  <Save fontSize="small" />
                </ListItemIcon>
                <ListItemText>Save Project</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  Ctrl + Alt + S
                </Typography>
              </MenuItem>
              <Divider/>
              <MenuItem>
                <ListItemIcon>
                  <Upload fontSize="small" />
                </ListItemIcon>
                <ListItemText>Import Project</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  Ctrl + Alt + I
                </Typography>
              </MenuItem>
              <Divider/>
              <MenuItem>
                <ListItemIcon>
                  <Settings fontSize="small" />
                </ListItemIcon>
                <ListItemText>Project Options</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  Ctrl + Alt + O
                </Typography>
              </MenuItem>
              <Divider/>
              <MenuItem>
                <ListItemIcon>
                  <AccountCircle fontSize="small" />
                </ListItemIcon>
                <ListItemText>User Settings</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  Ctrl + Alt + U
                </Typography>
              </MenuItem>
              <Divider/>
              <MenuItem>
                <ListItemIcon>
                  <Download fontSize="small" />
                </ListItemIcon>
                <ListItemText>Export Project</ListItemText>
                <Typography variant="body2" color="text.secondary">
                  Ctrl + Alt + E
                </Typography>
              </MenuItem>
              <Divider/>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  let data = this.state;
                  data.keyboardShortcutsDialogOpen = false;
                  this.setState(data);
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.projectBuildFailedDialog}
            onClose={() => {
              let data = this.state;
              data.projectBuildFailedDialog = false;
              this.setState(data);
            }}
            aria-labelledby='responsive-dialog-title'
          >
            <DialogTitle id='responsive-dialog-title'>
              Project Build Failed
            </DialogTitle>
            <DialogContent dividers>
              <DialogContentText>
                Your project has failed to compile. Mostly due to an error in your blocks, or due to a malfunction in the buildserver.
                Please check the below errors and follow the tips in the "What To Do" section to solve these errors.
              </DialogContentText>
              {this.state.projectErrors.map((error) =>
                <Accordion>
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls="panel1a-content"
                    id="panel1a-header"
                  >
                    <Typography>{error['error']}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography dangerouslySetInnerHTML={{__html: error['userErrorStr']}}>
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              )}
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  let data = this.state;
                  data.projectBuildFailedDialog = false;
                  this.setState(data);
                }}
              >
                Cancel
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.reauthenticationRequiredDialogOpen}
            onClose={() => {
              let data = this.state;
              data.reauthenticationRequiredDialogOpen = false;
              this.setState(data);
            }}
            aria-labelledby='responsive-dialog-title'
          >
            <DialogTitle id='responsive-dialog-title'>
              {t('reauth_required_title')}
            </DialogTitle>
            <DialogContent dividers>
              <TextField
                fullWidth
                onChange={(e) => {
                  const data = this.state;
                  data.reauthenticationDialogPassword = e.target.value;
                  this.setState(data);
                }}
                value={this.state.reauthenticationDialogPassword}
                required
                type={'password'}
                label={t('password')}
                variant='outlined'
                helperText={t('current_password')}
                style={{
                  marginTop: '10px', marginBottom: '20px'
                }}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  let data = this.state;
                  data.reauthenticationRequiredDialogOpen = false;
                  this.setState(data);
                }}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => {
                  let credential = firebase.auth.EmailAuthProvider.credential(firebase.auth().currentUser.email, this.state.reauthenticationDialogPassword);
                  firebase.auth().currentUser.reauthenticateWithCredential(credential).then(() => {
                    this.showSuccessSnackbar(t('reauth_success'));
                    let data = this.state;
                    data.reauthenticationRequiredDialogOpen = false;
                    this.setState(data);
                  }).catch((error) => {
                    this.showErrorSnackbar(error.message);
                  });
                }}
              >
                {t('update')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.deleteProjectDialogOpen}
            onClose={() => this.handleCloseDeleteProjectDialog(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
          >
            <DialogTitle id='alert-dialog-title'>
              {t('delete_projects')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id='alert-dialog-description'>
                {t('delete_projects_helper')}
              </DialogContentText>
              <FormGroup>
                <FormControlLabel control={<Checkbox value={this.state.backupSelectedProjects} onClick={(e) => {
                  console.log(e.currentTarget.getElementsByTagName('input')[0].checked);
                  let data = this.state;
                  data.backupSelectedProjects = e.currentTarget.getElementsByTagName('input')[0].checked;
                  this.setState(data);
                }} />} label={t('backup_deletes_projects')} />
              </FormGroup>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.handleCloseDeleteProjectDialog(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => this.handleCloseDeleteProjectDialog(true)}
                autoFocus
              >
                {t('confirm')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.aboutRapidDialogOpen}
            onClose={() => this.handleCloseAboutRapidDialog(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
          >
            <DialogTitle id='alert-dialog-title'>
              {t('about_rapid')}
            </DialogTitle>
            <DialogContent>
              <div
                style={{
                  textAlign: 'center'
                }}
              >
                <img
                  alt={"About Rapid"}
                  src={aboutDialog}
                  width={'300px'}
                  height={'250px'}
                ></img>
              </div>
              <DialogContentText id='alert-dialog-description'>
                {t('about_rapid_helper')}
              </DialogContentText>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => this.handleCloseAboutRapidDialog(false)}>{t('close')}</Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.userSettingsDialogOpen}
            onClose={() => this.handleCloseUserSettingsDialog()}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
          >
            <DialogTitle id='alert-dialog-title'>
              {t('settings')}
            </DialogTitle>
            <DialogContent dividers>
              <Tabs
                value={this.state.userSettingsTabValue}
                variant="fullWidth"
                indicatorColor='primary'
                textColor='primary'
                onChange={(event, value) => {
                  let data = this.state;
                  data.userSettingsTabValue = value;
                  this.setState(data);
                }}
              >
                <Tab
                  value={'account'}
                  label={<div>
                    <AccountCircle
                      style={{
                        verticalAlign: 'middle'
                      }}
                    />{' '}
                    {t('account')}
                  </div>}
                />
                <Tab
                  value={'appearance'}
                  label={<div>
                    <GridView
                      style={{
                        verticalAlign: 'middle'
                      }}
                    />{' '}
                    {t('appearance')}
                  </div>}
                />
              </Tabs>
              <TabPanel
                index={'account'}
                value={this.state.userSettingsTabValue}
              >
                <Avatar
                  onClick={() => {
                    if (this.uploadAccountIconRef) {
                      this.uploadAccountIconRef.click()
                    }
                  }}
                  alt={this.state.userName}
                  src={this.state.userPhotoBlob ? this.state.userPhotoBlob : ""}
                  sx={{
                    width: 115,
                    height: 115,
                    background: this.state.userPhotoBlob && this.state.userPhotoBlob.length ? "transparent" : "linear-gradient(-180deg, " + hexToRgb(this.state.userSettingsThemeColor) + " 0%, " + hexToRgb(shadeColor(this.state.userSettingsThemeColor, -40)) + " 85%)",
                    margin: '0 auto',
                    fontSize: '3.50rem'
                  }}
                />
                <input
                  type='file'
                  id='file'
                  accept=".png"
                  ref={(ref) => {
                    this.uploadAccountIconRef = ref;
                    if (ref) {
                      ref.onchange = (event) => {
                        this.userManager.updateUserPhoto(event.target.files[0], () => {
                          this.userManager.resolveImageURL((result) => {
                            let data = this.state;
                            data.userPhotoBlob = result;
                            this.setState(data)
                          })
                        })
                      };
                    }
                  }}
                  style={{
                    display: 'none'
                  }}
                />
                <TextField style={{ marginTop: '20px', marginBottom: '20px' }} label={t('username')} variant='outlined'
                           value={this.state.userName} onChange={(e) => {
                  let data = this.state;
                  data.userName = e.target.value || '';
                  this.setState(data);
                }} fullWidth helperText={t('username_helper')} />
                <Divider />
                <TextField style={{ marginTop: '20px', marginBottom: '20px' }} label='Email' disabled variant='outlined'
                           value={this.state.email} fullWidth
                           helperText={t('email_helper')} />
                <Divider />
                <div style={{
                  display: 'flex', marginTop: '20px',
                  justifyContent: 'center'
                }}>
                  <Button style={{ marginRight: '10px' }} variant='outlined' color={'error'} onClick={() => {
                    let data = this.state;
                    data.updatePasswordDialogOpen = true;
                    this.setState(data);
                  }}>{t('update_password')}</Button>
                  <Button variant='contained' color={'error'} onClick={() => {
                    let data = this.state;
                    data.deleteAccountDialogOpen = true;
                    this.setState(data);
                  }}>{t('delete_account')}</Button>
                </div>
              </TabPanel>
              <TabPanel
                index={'appearance'}
                value={this.state.userSettingsTabValue}
              >
                <Autocomplete
                  disablePortal
                  options={languages}
                  fullWidth
                  value={this.state.userSettingsLanguage ? this.state.userSettingsLanguage.label : languages[0]}
                  onChange={(e, newValue) => {
                    if (newValue) {
                      let data = this.state;
                      data.userSettingsLanguage = newValue;
                      this.setState(data);
                    }
                  }}
                  renderInput={(params) => (<TextField
                    helperText={t('language_helper')}
                    {...params}
                    label={t('language')}
                  />)}
                />
                <Divider
                  style={{
                    margin: '10px 0'
                  }}
                />
                <FormControl fullWidth>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch
                        checked={this.state.userSettingsTheme}
                        onChange={(e) => {
                          console.log(this.state.userSettingsTheme);
                          let data = this.state;
                          data.userSettingsTheme = e.target.checked;
                          if (data.userSettingsTheme) {
                            data.userSettingsThemeColor = '#ffffff';
                          } else {
                            data.userSettingsThemeColor = this.userManager.getUser().themeColor;
                          }
                          this.setState(data, () => {
                            if (e.target.checked) {
                              document.body.classList.add('DarkTheme');
                            } else {
                              document.body.classList.remove('DarkTheme');
                            }
                          });
                        }}
                      />}
                      label={t('dark_theme')}
                    />
                    <FormHelperText>
                      {t('dark_theme_helper')}
                    </FormHelperText>
                  </FormGroup>
                </FormControl>
                <Divider
                  style={{
                    margin: '15px 0'
                  }}
                />
                <FormControl fullWidth>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch
                        checked={this.state.userSettingsGridView}
                        onChange={(e) => {
                          console.log(this.state.userSettingsGridView);
                          let data = this.state;
                          data.userSettingsGridView = e.target.checked;
                          this.setState(data);
                        }}
                      />}
                      label={t('grid_view')}
                    />
                    <FormHelperText>
                      {t('grid_view_helper')}
                    </FormHelperText>
                  </FormGroup>
                </FormControl>
                <Divider
                  style={{
                    margin: '15px 0'
                  }}
                />
                <FormControl fullWidth>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch
                        checked={this.state.userSettingsSuppressWarnings}
                        onChange={(e) => {
                          console.log(this.state.userSettingsSuppressWarnings);
                          let data = this.state;
                          data.userSettingsSuppressWarnings = e.target.checked;
                          this.setState(data);
                        }}
                      />}
                      label={t('suppress_warnings')}
                    />
                    <FormHelperText>
                      {t('suppress_warnings_helper')}
                    </FormHelperText>
                  </FormGroup>
                </FormControl>
                <Divider
                  style={{
                    margin: '15px 0'
                  }}
                />
                <FormControl fullWidth>
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch
                        checked={this.state.userSettingsAutoload}
                        onChange={(e) => {
                          let data = this.state;
                          data.userSettingsAutoload = e.target.checked;
                          this.setState(data);
                        }}
                      />}
                      label={t('autoload_projects')}
                    />
                    <FormHelperText>
                      {t('autoload_projects_helper')}
                    </FormHelperText>
                  </FormGroup>
                </FormControl>
                <Divider
                  style={{
                    margin: '15px 0'
                  }}
                />
                <TextField
                  id='outlined-basic'
                  label={t('color')}
                  variant='outlined'
                  fullWidth
                  value={this.state.userSettingsThemeColor}
                  onClick={this.handleOpenColorPicker}
                  helperText={t('color_helper')}
                />
                <Popover
                  open={!!this.state.colorPickerAnchorEl}
                  anchorEl={this.state.colorPickerAnchorEl}
                  onClose={this.handleCloseColorPicker}
                  anchorOrigin={{
                    vertical: 'bottom', horizontal: 'left'
                  }}
                >
                  <SketchPicker
                    color={this.state.userSettingsThemeColor}
                    onChangeComplete={this.handleChangeComplete}
                    presetColors={['#6200ee', '#F5A623', '#F8E71C', '#8B572A', '#7ED321', '#417505', '#BD10E0', '#9013FE', '#4A90E2', '#50E3C2', '#B8E986', '#000000', '#4A4A4A', '#9B9B9B', '#FFFFFF']}
                  />
                </Popover>
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.handleCloseUserSettingsDialog()}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => this.handleSaveUserSettings()}
              >
                {t('save')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.adminDialogOpen}
            onClose={() => {
              let data = this.state;
              data.adminDialogOpen = false;
              this.setState(data);
            }}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
          >
            <DialogTitle id='alert-dialog-title'>
              {t('admin')}
            </DialogTitle>
            <DialogContent dividers>
              <Tabs
                value={this.state.adminTabValue}
                variant={'fullWidth'}
                indicatorColor='primary'
                textColor='primary'
                onChange={(event, value) => {
                  let data = this.state;
                  data.adminTabValue = value;
                  this.setState(data);
                }}
              >
                <Tab
                  value={'dashboard'}
                  label={<div>
                    <Dashboard
                      style={{
                        verticalAlign: 'middle'
                      }}
                    />{' '}
                    {t('dashboard')}
                  </div>}
                />
                <Tab
                  value={'users'}
                  label={<div>
                    <Group
                      style={{
                        verticalAlign: 'middle'
                      }}
                    />{' '}
                    {t('users')}
                  </div>}
                />
              </Tabs>
              <TabPanel
                index={'dashboard'}
                value={this.state.adminTabValue}
              >
                <div>
                  <Typography>This feature isn't implemented yet!</Typography>
                </div>
              </TabPanel>
              <TabPanel
                index={'users'}
                value={this.state.adminTabValue}
              >
                {this.displayUserListView()}
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => {
                  let data = this.state;
                  data.adminDialogOpen = false;
                  this.setState(data);
                }}
              >
                {t('close')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            fullScreen
            open={this.state.importClassDialogOpen}
            onClose={() => this.handleCloseImportClassDialog()}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
          >
            <DialogTitle id='alert-dialog-title'>
              {t('import_class')}
            </DialogTitle>
            <DialogContent
              dividers
              id={'classes-data-grid'}
            >
              <TextField
                label={t('search')}
                onChange={(e) => {
                  let data = this.state;
                  data.classesDataFiler = e.target.value;
                  this.setState(data);
                }}
                fullWidth
                sx={{
                  marginBottom: '20px'
                }}
                variant='outlined'
                InputProps={{
                  endAdornment: (<InputAdornment position='end'>
                    <Tooltip title={t('search')}>
                    <IconButton
                      onClick={() => {
                        this.loadClassesData(this.state.classesDataFiler);
                      }}
                      edge='end'
                    >
                      <Search />
                    </IconButton>
                    </Tooltip>
                  </InputAdornment>)
                }}
              />
              {this.renderClassesData()}

            </DialogContent>
            <DialogActions dividers>
              <Button
                onClick={() => this.handleCloseImportClassDialog()}
              >
                {t('close')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.exportProjectDialogOpen}
            onClose={() => this.handleCloseExportProjectDialog(false)}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
          >
            <DialogTitle id='alert-dialog-title'>
              {t('export_projects')}
            </DialogTitle>
            <DialogContent>
              <DialogContentText id='alert-dialog-description'>
                {t('export_projects_helper')}
              </DialogContentText>
              <FormControl component='fieldset'>
                <RadioGroup
                  row
                  aria-label='gender'
                  name='row-radio-buttons-group'
                >
                  <FormControlLabel
                    value='zip'
                    control={<Radio
                      checked={this.state.exportAsZipRadioChecked}
                      onChange={(e) => {
                        let data = this.state;
                        data.exportAsZipRadioChecked = e.target.checked;
                        data.exportAsMultipleRadioChecked = false;
                        this.setState(data);
                      }}
                    />}
                    label={'export_zip'}
                  />
                  <FormControlLabel
                    value='multiple'
                    control={<Radio
                      checked={this.state.exportAsMultipleRadioChecked}
                      onChange={(e) => {
                        let data = this.state;
                        data.exportAsMultipleRadioChecked = e.target.checked;
                        data.exportAsZipRadioChecked = false;
                        this.setState(data);
                      }}
                    />}
                    label={t('export_multiple')}
                  />
                </RadioGroup>
              </FormControl>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={() => this.handleCloseExportProjectDialog(false)}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={() => this.handleCloseExportProjectDialog(true)}
                autoFocus
              >
                {t('export')}
              </Button>
            </DialogActions>
          </Dialog>
          <Dialog
            open={this.state.optionsDialogOpen}
            onClose={this.handleCloseProjectOptionsDialog}
            aria-labelledby='alert-dialog-title'
            aria-describedby='alert-dialog-description'
            fullScreen
          >
            <DialogTitle id='alert-dialog-title'>
              {t('project_settings')}
            </DialogTitle>
            <DialogContent dividers>
              <Box
                sx={{ width: '100%' }}
              >
                <Box
                  sx={{
                    borderBottom: 1, borderColor: 'divider'
                  }}
                >
                  <Tabs
                    value={this.state.projectOptionsTabValue}
                    variant="fullWidth"
                    indicatorColor='primary'
                    textColor='primary'
                    onChange={this.handleChangeProjectOptionsTab}
                  >
                    <Tab
                      value={'general'}
                      label={<div>
                        <Extension
                          style={{
                            verticalAlign: 'middle'
                          }}
                        />{' '}
                        {t('general')}
                      </div>}
                    />
                    <Tab
                      value={'publishing'}
                      label={<div>
                        <Publish
                          style={{
                            verticalAlign: 'middle'
                          }}
                        />{' '}
                        {t('publishing')}
                      </div>}
                    />
                    <Tab
                      value={'android_manifest'}
                      label={<div>
                        <Code
                          style={{
                            verticalAlign: 'middle'
                          }}
                        />{' '}
                        {t('android_manifest')}
                      </div>}
                    />
                    <Tab
                      value={'libraries'}
                      label={<div>
                        <LibraryAdd
                          style={{
                            verticalAlign: 'middle'
                          }}
                        />{' '}
                        {t('libraries')}
                      </div>}
                    />
                  </Tabs>
                </Box>
              </Box>
              <TabPanel
                index={'general'}
                value={this.state.projectOptionsTabValue}
              >
                <TextField
                  onChange={(e) => {
                    let data = this.state;
                    data.projectOptionsProjectName = e.target.value || '';
                    this.setState(data);
                  }}
                  disabled
                  error={this.state.projectOptionsProjectName !== undefined ? this.state.projectOptionsProjectName.length > 0 && !this.isClassNameValid(this.state.projectOptionsProjectName) : false}
                  fullWidth
                  variant={'outlined'}
                  label={t('name')}
                  value={this.state.projectOptionsProjectName !== undefined ? this.state.projectOptionsProjectName : ''}
                  helperText={t('project_options_name_helper')}
                />
                <Divider
                  style={{
                    marginTop: '10px', marginBottom: '20px'
                  }}
                />
                <TextField
                  onChange={(e) => {
                    let data = this.state;
                    data.projectOptionsPackageName = e.target.value || '';
                    this.setState(data);
                  }}
                  disabled
                  error={this.state.projectOptionsPackageName !== undefined ? this.state.projectOptionsPackageName.length > 0 && !this.isPackageNameValid(this.state.projectOptionsPackageName) : false}
                  fullWidth
                  variant={'outlined'}
                  label={t('package_name')}
                  value={this.state.projectOptionsPackageName !== undefined ? this.state.projectOptionsPackageName : ''}
                  helperText={t('project_options_package_name_helper')}
                />
                <Divider
                  style={{
                    marginTop: '10px', marginBottom: '20px'
                  }}
                />
                <TextField
                  onChange={(e) => {
                    let data = this.state;
                    data.projectOptionsProjectDescription = e.target.value;
                    this.setState(data);
                  }}
                  fullWidth
                  multiline
                  variant={'outlined'}
                  label={t('helper_text')}
                  value={typeof this.state.projectOptionsProjectDescription === 'string' ? this.state.projectOptionsProjectDescription : ''}
                  helperText={t('project_options_helper_text_helper')}
                />
                <Divider
                  style={{
                    marginTop: '10px', marginBottom: '20px'
                  }}
                />
                <TextField
                  onChange={(e) => {
                    let data = this.state;
                    data.projectOptionsVersionName = e.target.value || '';
                    this.setState(data);
                  }}
                  fullWidth
                  variant={'outlined'}
                  label={t('version_name')}
                  value={this.state.projectOptionsVersionName !== undefined ? this.state.projectOptionsVersionName : ''}
                  helperText={t('version_name_helper')}
                />
                <Divider
                  style={{
                    marginTop: '10px', marginBottom: '20px'
                  }}
                />
                <TextField
                  onChange={(e) => {
                    let data = this.state;
                    data.projectOptionsVersionNumber = e.target.value || '';
                    this.setState(data);
                  }}
                  type={'number'}
                  fullWidth
                  variant={'outlined'}
                  label={t('version_number')}
                  value={this.state.projectOptionsVersionNumber !== undefined ? this.state.projectOptionsVersionNumber : ''}
                  helperText={t('version_number_helper')}
                />
                <Divider
                  style={{
                    marginTop: '10px', marginBottom: '20px'
                  }}
                />
                <TextField
                  onChange={(e) => {
                    let data = this.state;
                    data.projectOptionsHomeWebsite = e.target.value || '';
                    this.setState(data);
                  }}
                  error={this.state.projectOptionsHomeWebsite && this.state.projectOptionsHomeWebsite.length !== 0 && !this.isValidUrl(this.state.projectOptionsHomeWebsite)}
                  fullWidth
                  variant={'outlined'}
                  label={t('home_website')}
                  value={this.state.projectOptionsHomeWebsite !== undefined ? this.state.projectOptionsHomeWebsite : ''}
                  helperText={t('home_website_helper')}
                />
                <Divider
                  style={{
                    marginTop: '10px', marginBottom: '20px'
                  }}
                />
                <Autocomplete
                  disablePortal
                  options={androidSdks}
                  fullWidth
                  value={this.state.projectOptionsMinSdk ? this.state.projectOptionsMinSdk.label : androidSdks[0]}
                  onChange={(e, newValue) => {
                    if (newValue) {
                      let data = this.state;
                      data.projectOptionsMinSdk = newValue;
                      this.setState(data);
                    }
                  }}
                  renderInput={(params) => (<TextField
                    helperText={t('min_sdk_helper')}
                    {...params}
                    label={t('min_sdk')}
                  />)}
                />
                <Divider
                  style={{
                    marginTop: '10px', marginBottom: '20px'
                  }}
                />
                <TextField
                  variant='outlined'
                  label={t('project_icon')}
                  fullWidth
                  helperText={t('project_icon_helper')}
                  value={this.state.projectOptionsIcon}
                  InputProps={{
                    endAdornment: (<InputAdornment position='end'>
                      <Tooltip title="Upload">
                      <IconButton
                        onClick={this.openUploadFile}
                      >
                        <AttachFile />
                      </IconButton>
                      </Tooltip>
                    </InputAdornment>)
                  }}
                ></TextField>
                <input
                  type='file'
                  id='file'
                  ref={(ref) => {
                    console.log('rEFF', ref);
                    this.uploadProjectFileInput = ref;
                  }}
                  style={{
                    display: 'none'
                  }}
                />
              </TabPanel>
              <TabPanel
                index={'publishing'}
                value={this.state.projectOptionsTabValue}
              >
                <FormControl
                  fullWidth
                >
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch
                        checked={this.state.projectOptionsProguard}
                        onChange={(e) => {
                          console.log(this.state.projectOptionsProguard);
                          let data = this.state;
                          data.projectOptionsProguard = e.target.checked;
                          this.setState(data);
                        }}
                      />}
                      label={t('project_icon')}
                    />
                    <FormHelperText>
                      {t('project_icon_helper')}
                    </FormHelperText>
                  </FormGroup>
                </FormControl>
                <Divider
                  style={{
                    marginTop: '10px', marginBottom: '20px'
                  }}
                />
                <FormControl
                  fullWidth
                >
                  <FormGroup>
                    <FormControlLabel
                      control={<Switch
                        checked={this.state.projectOptionsAutoIncrement}
                        onChange={(e) => {
                          console.log(this.state.projectOptionsAutoIncrement);
                          let data = this.state;
                          data.projectOptionsAutoIncrement = e.target.checked;
                          this.setState(data);
                        }}
                      />}
                      label={t('auto_increment_version')}
                    />
                    <FormHelperText>
                      {t('auto_increment_version_helper')}
                    </FormHelperText>
                  </FormGroup>
                </FormControl>
                <Divider
                  style={{
                    marginTop: '10px', marginBottom: '20px'
                  }}
                />
              </TabPanel>
              <TabPanel
                index={'android_manifest'}
                value={this.state.projectOptionsTabValue}
              >
                  <CodeEditor
                    value={this.state.projectOptionsAndroidManifest}
                  language="xml"
                  placeholder={t('android_manifest_placeholder')}
                  onChange={(event) => {
                    let data = this.state;
                    data.projectOptionsAndroidManifest = event.target.value;
                    this.setState(data);
                  }}
                  padding={15}
                     style={{
                       width:"100%",
                       height:"100%",
                    fontSize: 16,
                    backgroundColor: "#f5f5f5",
                    fontFamily: 'ui-monospace,SFMono-Regular,SF Mono,Consolas,Liberation Mono,Menlo,monospace',
                  }}
                />
              </TabPanel>
              <TabPanel
                index={'libraries'}
                value={this.state.projectOptionsTabValue}
              >
                {this.state.currentProject && this.state.currentProject.libraries ? (this.state.currentProject.libraries.length === 0 ?
                  (<div style={{textAlign: "center"}}>
                <Lottie
                  loop
                  animationData={librariesLottieJson}
                  play
                  style={{
                    height: 250, marginBottom: '-51px'
                  }}
                />
                <h3>{t('no_libraries_found')}</h3>
                <Button startIcon={<Upload/>} variant={"outlined"} onClick={() => {
                  let data = this.state;
                  data.importLibraryDialogOpen = true;
                  this.setState(data);
                }}>{t('import_library')}</Button>
                </div>) : (<div style={{textAlign: "center"}}>
                    <List dense={false}>
                      {this.state.currentProject.libraries.map((library) =>
                        <ListItem
                          secondaryAction={
                    <Tooltip title="Delete">
                            <IconButton edge="end" aria-label="delete" onClick={() => {
                              let data = this.state;
                              let newProjectLibrariesBlob = this.state.projectLibrariesBlob;
                              let newProject = this.state.currentProject;
                              newProject.libraries.splice(this.state.currentProject.libraries.indexOf(library), 1)
                              newProjectLibrariesBlob.splice(this.state.currentProject.libraries.indexOf(library), 1);
                              data.projectLibrariesBlob = newProjectLibrariesBlob;
                              data.currentProject = newProject;
                              this.setState(data);
                              this.projectManager.updateProject(newProject, this.state.projectIconBlob, this.blocklyWorkspace, this.state.projectLibrariesBlob, (status) => {
                                if (status === 200) {
                                  this.showSuccessSnackbar(t('library_delete_success'));
                                } else if (status === 413) {
                                  this.showErrorSnackbar(t("cloud_limit_exceeded"))
                                } else {
                                  this.showErrorSnackbar(t('library_delete_failed'))
                                }
                              })
                            }
                            }>
                              <Delete />
                            </IconButton>
                    </Tooltip>
                          }
                        >
                          <ListItemAvatar>
                            <Avatar>
                              <Folder />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={library}
                          />
                        </ListItem>,
                      )}
                    </List>
                    <Button startIcon={<Upload/>} variant={"outlined"} onClick={() => {
                      let data = this.state;
                      data.importLibraryDialogOpen = true;
                      this.setState(data);
                    }}>{t('import_library')}</Button>
                  </div>)) : <div></div>}
              </TabPanel>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={this.handleCloseProjectOptionsDialog}
              >
                {t('cancel')}
              </Button>
              <Button
                onClick={this.handleSaveProjectSettings}
                autoFocus
              >
                {t('save')}
              </Button>
            </DialogActions>
          </Dialog>
          <xml
            id='toolbox'
            style={{display: 'none'}}
          >
            <category
              colour='#43A047'
              name={t('logic')}
            >
              <block type='controls_if' />
              <block type='logic_compare' />
              <block type='logic_operation' />
              <block type='logic_negate' />
              <block type='logic_boolean' />
              <block type='logic_null' />
              <block type='logic_this' />
              <block type='logic_ternary' />
            </category>
            <category
              colour='#EF6C00'
              name={t('loops')}
            >
              <block type='controls_repeat_ext'>
                <value name='TIMES'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      10
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='controls_whileUntil' />
              <block type='controls_try_catch' />
              <block type='controls_for'>
                <value name='FROM'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      1
                    </field>
                  </shadow>
                </value>
                <value name='TO'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      10
                    </field>
                  </shadow>
                </value>
                <value name='BY'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      1
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='controls_forEach' />
              <block type='controls_flow_statements' />
            </category>
            <category
              colour='#0D47A1'
              name={t('math')}
            >
              <block type='math_number' />
              <block type='math_arithmetic'>
                <value name='A'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      1
                    </field>
                  </shadow>
                </value>
                <value name='B'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      1
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='math_single'>
                <value name='NUM'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      9
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='math_trig'>
                <value name='NUM'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      45
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='math_constant' />
              <block type='math_number_property'>
                <value name='NUMBER_TO_CHECK'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      0
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='math_change'>
                <value name='DELTA'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      1
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='math_round'>
                <value name='NUM'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      3.1
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='math_modulo'>
                <value name='DIVIDEND'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      64
                    </field>
                  </shadow>
                </value>
                <value name='DIVISOR'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      10
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='math_constrain'>
                <value name='VALUE'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      50
                    </field>
                  </shadow>
                </value>
                <value name='LOW'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      1
                    </field>
                  </shadow>
                </value>
                <value name='HIGH'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      100
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='math_random_int'>
                <value name='FROM'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      1
                    </field>
                  </shadow>
                </value>
                <value name='TO'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      100
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='math_random_float' />
            </category>
            <category
              colour='#D50000'
              name={t('text')}
            >
              <block type='text' />
              <block type='text_join' />
              <block type='text_append'>
                <value name='TEXT'>
                  <shadow type='text' />
                </value>
              </block>
              <block type='text_length'>
                <value name='VALUE'>
                  <shadow type='text'>
                    <field name='TEXT'>
                      abc
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='text_isEmpty'>
                <value name='VALUE'>
                  <shadow type='text'>
                    <field name='TEXT' />
                  </shadow>
                </value>
              </block>
              <block type='text_indexOf'>
                <value name='VALUE'>
                  <block type='variables_get'>
                    <field name='VAR'>
                      text
                    </field>
                  </block>
                </value>
                <value name='FIND'>
                  <shadow type='text'>
                    <field name='TEXT'>
                      abc
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='text_charAt'>
                <value name='VALUE'>
                  <block type='variables_get'>
                    <field name='VAR'>
                      text
                    </field>
                  </block>
                </value>
              </block>
              <block type='text_getSubstring'>
                <value name='STRING'>
                  <block type='variables_get'>
                    <field name='VAR'>
                      text
                    </field>
                  </block>
                </value>
              </block>
              <block type='text_changeCase'>
                <value name='TEXT'>
                  <shadow type='text'>
                    <field name='TEXT'>
                      abc
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='text_trim'>
                <value name='TEXT'>
                  <shadow type='text'>
                    <field name='TEXT'>
                      abc
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='text_print'>
                <value name='TEXT'>
                  <shadow type='text'>
                    <field name='TEXT'>
                      abc
                    </field>
                  </shadow>
                </value>
              </block>
            </category>
            <category
              colour='#29B6F6'
              name={t('lists')}
            >
              <block type='lists_create_with'>
                <mutation items='0' />
              </block>
              <block type='lists_create_with' />
              <block type='lists_repeat'>
                <value name='NUM'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      5
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='lists_length' />
              <block type='lists_isEmpty' />
              <block type='lists_indexOf'>
                <value name='VALUE'>
                  <block type='variables_get'>
                    <field name='VAR'>
                      list
                    </field>
                  </block>
                </value>
              </block>
              <block type='lists_getIndex'>
                <value name='VALUE'>
                  <block type='variables_get'>
                    <field name='VAR'>
                      list
                    </field>
                  </block>
                </value>
              </block>
              <block type='lists_setIndex'>
                <value name='LIST'>
                  <block type='variables_get'>
                    <field name='VAR'>
                      list
                    </field>
                  </block>
                </value>
              </block>
              <block type='lists_getSublist'>
                <value name='LIST'>
                  <block type='variables_get'>
                    <field name='VAR'>
                      list
                    </field>
                  </block>
                </value>
              </block>
              <block type='lists_split'>
                <value name='DELIM'>
                  <shadow type='text'>
                    <field name='TEXT'>
                      ,
                    </field>
                  </shadow>
                </value>
              </block>
            </category>
            <category
              colour='#9E9E9E'
              name={t('colors')}
            >
              <block type='colour_picker' />
              <block type='colour_random' />
              <block type='colour_rgb'>
                <value name='RED'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      100
                    </field>
                  </shadow>
                </value>
                <value name='GREEN'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      50
                    </field>
                  </shadow>
                </value>
                <value name='BLUE'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      0
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='colour_blend'>
                <value name='COLOUR1'>
                  <shadow type='colour_picker'>
                    <field name='COLOUR'>
                      #ff0000
                    </field>
                  </shadow>
                </value>
                <value name='COLOUR2'>
                  <shadow type='colour_picker'>
                    <field name='COLOUR'>
                      #3333ff
                    </field>
                  </shadow>
                </value>
                <value name='RATIO'>
                  <shadow type='math_number'>
                    <field name='NUM'>
                      0.5
                    </field>
                  </shadow>
                </value>
              </block>
              <block type='colour_hex_to_decimal'>
                <value name='HEX'>
                  <shadow type='colour_picker'>
                    <field name='COLOUR'>
                      #ff0000
                    </field>
                  </shadow>
                </value>
              </block>
            </category>
            <sep />
            <category
              colour='#E65100'
              custom='VARIABLE'
              id={'variableCategory'}
              name={t('variables')}
            >
              <block type='initialize_variable'>
                <field name='NAME'>
                variable
              </field>
              </block>
            </category>
            <category
              colour='#4527A0'
              name={t('functions')}
            >
              <block type='procedures_defnoreturn'>
                <field name='NAME'>
                  myFunction
                </field>
              </block>
              <block type='procedures_defreturn'>
                <field name='NAME'>
                  myFunction
                </field>
                <field name="PROCEDURE_RETURN_TYPE">Number</field>
              </block>
              <block type='procedures_deffunctionnoreturn'>
                <field name='NAME'>
                  MyFunction
                </field>
              </block>
              <block type='procedures_deffunctionreturn'>
                <field name='NAME'>
                  MyFunction
                </field>
                <field name="PROCEDURE_RETURN_TYPE">Number</field>
              </block>
              <block type='procedures_defpropertynoreturn'>
                <field name='NAME'>
                  MyProperty
                </field>
                <field name={"DESIGNER"}>
                  TRUE
                </field>
              </block>
              <block type='procedures_defpropertyreturn'>
                <field name='NAME'>
                  MyProperty
                </field>
                <field name="PROCEDURE_RETURN_TYPE">Number</field>
              </block>
              <block type='procedures_defeventnoreturn'>
                <field name='NAME'>
                  MyEvent
                </field>
              </block>
            </category>
          </xml>
        </div>
        <Portal>
          <Snackbar
            onClose={() => this.showSnackbar(undefined)}
            open={this.state.snackbarMessage}
            autoHideDuration={3000}
            message={this.state.snackbarMessage ? this.state.snackbarMessage : ''}
          />
        </Portal>
        <Portal>
          <Snackbar
            onClose={() => this.showSuccessSnackbar(undefined)}
            open={this.state.successSnackbarMessage}
            autoHideDuration={3000}
          >
            <Alert
              onClose={() => this.showSuccessSnackbar(undefined)}
              severity='success'
              variant={'filled'}
              sx={{ width: '100%' }}
            >
              {this.state.successSnackbarMessage ? this.state.successSnackbarMessage : ''}
            </Alert>
          </Snackbar>
        </Portal>
        <Portal>
          <Snackbar
            onClose={() => this.showErrorSnackbar(undefined)}
            open={this.state.errorSnackbarMessage}
            autoHideDuration={3000}
          >
            <Alert
              onClose={() => this.showErrorSnackbar(undefined)}
              severity='error'
              variant={'filled'}
              sx={{ width: '100%' }}
            >
              {this.state.errorSnackbarMessage ? this.state.errorSnackbarMessage : ''}
            </Alert>
          </Snackbar>
        </Portal>
        <Backdrop
          sx={{
            color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1
          }}
          open={this.state.buildingProject}
        >
          <div
            style={{
              textAlign: 'center'
            }}
          >
            <CircularProgress color='inherit' />
            <p>{t('building_project')}</p>
            <p>{this.state.buildingStatus}</p>
          </div>
        </Backdrop>
        <Backdrop
          sx={{
            color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1
          }}
          open={this.state.loadingProject}
        >
          <div
            style={{
              textAlign: 'center'
            }}
          >
            <CircularProgress color='inherit' />
            <p>{t('loading_project')}</p>
          </div>
        </Backdrop>
        <Backdrop
          sx={{
            color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1
          }}
          open={this.state.importingClass}
        >
          <div
            style={{
              textAlign: 'center'
            }}
          >
            <CircularProgress color='inherit' />
            <p>{t('importing_class')}</p>
          </div>
        </Backdrop>
        <Dialog
          open={this.state.projectBuiltDialogOpen}
          onClose={this.handleCloseProjectBuiltDialog}
          aria-labelledby='alert-dialog-title'
          aria-describedby='alert-dialog-description'
        >
          <DialogTitle id='alert-dialog-title'>
            {t('project_build_success')}
          </DialogTitle>
          <DialogContent dividers>
            <DialogContentText id='alert-dialog-description'>
              {t('project_build_success_helper')}
            </DialogContentText>
            <div
              style={{
                textAlign: 'center'
              }}
            >
              <QRCode
                value={this.projectDownloadLink}
                size={150}
              />
            </div>
            <div
              style={{
                textAlign: 'center'
              }}
            >
              <Button
                href={this.projectDownloadLink}
                style={{
                  width: '240px', marginTop: '20px'
                }}
                startIcon={<Download />}
                variant={'outlined'}
              >
                {t('download_extension')}
              </Button>
            </div>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={this.handleCloseProjectBuiltDialog}
            >
              {t('close')}
            </Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </ThemeProvider>) : (<ThemeProvider theme={this.theme}>
      <div
        className={'centered-progress'}
      >
        <CircularProgress />
      </div>
    </ThemeProvider>);
  }

  handleCloseProjectBuiltDialog() {
    let data = this.state;
    data.projectBuiltDialogOpen = false;
    this.setState(data);
  }

  renderFileList() {
    const { t } = this.props;
    if (this.state.fileSelected) {
      return (<ListItem>
        <ListItemAvatar>
          <Avatar>
            <Folder />
          </Avatar>
        </ListItemAvatar>
        <ListItemText
          primary={this.state.fileSelectedName}
          secondary={this.state.fileSelectedDescription}
        />
      </ListItem>);
    } else {
      return (<div>
        <p
          style={{
            textAlign: 'center', opacity: '0.7'
          }}
        >
          {t('selected_files_appear_here')}
        </p>
      </div>);
    }
  }

  showSnackbar(message) {
    const data = this.state;
    data.snackbarMessage = message;
    this.setState(data);
  }

  handleNewProjectDialogClose() {
    const data = this.state;
    data.newProjectDialogOpen = false;
    this.setState(data);
  }

  doCreateNewProject() {
    // validate inputs
    const { t } = this.props;
    if (!this.state.newProjectDialogProjectName || this.state.newProjectDialogProjectName.length === 0) {
      this.showErrorSnackbar(t('enter_project_name'));
      return;
    }
    if (!this.isClassNameValid(this.state.newProjectDialogProjectName)) {
      this.showErrorSnackbar(t('invalid_project_name'));
      return;
    }
    if (!this.state.newProjectDialogProjectPackageName || this.state.newProjectDialogProjectPackageName.length === 0) {
      this.showErrorSnackbar(t('enter_package_name'));
      return;
    }
    if (!this.isPackageNameValid(this.state.newProjectDialogProjectPackageName)) {
      this.showErrorSnackbar(t('invalid_package_name'));
      return;
    }
    this.projectManager.newProject({
      name: this.state.newProjectDialogProjectName,
      packageName: this.state.newProjectDialogProjectPackageName,
      description: this.state.newProjectDialogProjectDescription.replaceAll('\n', '<br>') || ''
    }, (statusCode, project) => {
      if (statusCode === 200) {
        console.log(project);
        this.projectToLoad = project;
        this.loadProjects();
        let data = this.state;
        data.projects = undefined;
        data.newProjectDialogProjectName = '';
        data.newProjectDialogProjectDescription = '';
        data.newProjectDialogProjectPackageName = '';
        this.setState(data);
      } else {
        let data = this.state;
        data.loadingProject = false;
        this.setState(data)
        if (statusCode === 409) {
          this.showErrorSnackbar(t('project_same_name_exists'));
        } else if (statusCode === 413) {
          this.showErrorSnackbar(t("cloud_storage_limit_exceeded"));
        } else if (statusCode === 402) {
          this.showErrorSnackbar(t('number_of_projects_exceeded'));
        } else if (statusCode === 401) {
          this.showSessionExpiredDialog()
        } else {
          this.showErrorSnackbar(t('server_encountered_error_status') + statusCode);
        }
      }
    });
    this.handleNewProjectDialogClose();
  }

  doDeleteSelectedProjects() {
    this.deleteProjects(this.state.checkedProjects);
  }

  displayListView() {
    const {t} = this.props
    if (!this.state.userSettingsGridView) {
      return <tr id={'projects-list'} style={this.state.projects && this.state.projects.length !== 0 ?
        { display: 'table-row', verticalAlign: 'top' } : { display: 'none' }}>
        <td style={{ textAlign: 'center' }}>
          <Box sx={{ bgcolor: 'background.paper' }} style={{ overflow: 'scroll', height: 'calc(100vh - 150px)' }}>
            <nav>
              <List>
                {this.state.projects.map((project) =>
                  <div>
                    <ListItem disablePadding secondaryAction={
                      <Checkbox
                        onClick={(e) => this.handleToggle(e, project)}
                        edge="end"
                        checked={this.state.checkedProjects.indexOf(project) !== -1}
                        tabIndex={-1}
                        disableRipple
                      />
                    }>
                      <ListItemButton disableRipple={this.state.checkedProjects.length > 0}
                                      onClick={() => {
                                        if (!(this.state.checkedProjects.length > 0)) {
                                          this.openProject(project);
                                        }
                                      }}
                                      style={{ height: '75px'}} dense>
                        <ListItemAvatar>
                        <Avatar
                          sx={{
                            background: "linear-gradient(-180deg, " + hexToRgb(this.state.userSettingsThemeColor) + " 0%, " + hexToRgb(shadeColor(this.state.userSettingsThemeColor, -40)) + " 85%)",
                          }}
                        >
                          {project.name.charAt(0)}
                        </Avatar>
                        </ListItemAvatar>
                        <ListItemText primary={project.name}
                                      secondary={project.description ? project.description : ''} />
                      </ListItemButton>
                    </ListItem>
                    <Divider variant='middle' />
                  </div>
                )}
              </List>
            </nav>
          </Box>
        </td>
      </tr>;
    } else {
      const formatter = new Intl.DateTimeFormat("en-GB", { // <- re-use me
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      })
      return <Grid
        container
        rowSpacing={1}
        columnSpacing={{
          xs: 1, sm: 1, md: 2
        }}
        style={{height: "82vh",
          overflow: "scroll",    padding: "10px"}}
      >
        {this.state.projects.map((project) => (<Grid item xs={3}>
          <Card
            sx={{ minWidth: 100 }}
            variant={'outlined'}
            onClick={() => {
              if (!(this.state.checkedProjects.length > 0)) {
                this.openProject(project);
              }
            }}
          >
            <CardActionArea>
              <CardContent>
                <div
                  style={{
                    display: 'flex', verticalAlign: 'middle', marginBottom: '16px', alignItems: 'center'
                  }}
                >
                  <Avatar
                    sx={{
                      width: 60,
                      height: 60,
                      background: "linear-gradient(-180deg, " + hexToRgb(this.state.userSettingsThemeColor) + " 0%, " + hexToRgb(shadeColor(this.state.userSettingsThemeColor, -40)) + " 85%)",
                      fontSize: '35px',
                      marginRight: '10px'
                    }}
                  >
                    {project.name.charAt(0)}
                  </Avatar>
                  <Typography
                    noWrap
                    variant='h6'
                    component='div'
                  >
                    {project.name}
                  </Typography>
                </div>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 14
                  }}
                  color='text.secondary'
                  gutterBottom
                >
                  {project.description}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 14
                  }}
                  color='text.secondary'
                  gutterBottom
                >
                  {t('created_at') + formatter.format(new Date(project.createdAt)) + ", " + new Date(project.createdAt).toLocaleTimeString()}
                </Typography>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 14,
                  }}
                  color='text.secondary'
                  gutterBottom
                >
                  {t('updated_at') + formatter.format(new Date(project.updatedAt)) + ", " + new Date(project.updatedAt).toLocaleTimeString()}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(project);
                    this.openProject(project, true, (project) => {
                      this.blocklyWorkspace.createProjectFile(project, this.state.projectIconBlob, this.state.projectLibrariesBlob, (data) => {
                        saveAs(data, project['name'] + '.rbx');
                      });
                    })
                  }}
                  startIcon={<Download />}
                  size='small'
                >
                  {t('export')}
                </Button>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(project);
                    this.deleteProjects([project]);
                  }}
                  startIcon={<Delete />}
                  size='small'
                >
                  {t('delete')}
                </Button>

              </CardActions>
            </CardActionArea>
          </Card></Grid>))}
      </Grid>;
    }
  }

  displayUserListView() {
    const {t} = this.props
    return <tr id={'user-list'} style={this.state.adminUsers && this.state.adminUsers.length !== 0 ?
      { display: 'table-row', verticalAlign: 'top' } : { display: 'none' }}>
      <td style={{ textAlign: 'center' }}>
        <Box sx={{ bgcolor: 'background.paper' }} style={{ overflow: 'scroll' }}>
          <nav>
            <List>
              {this.state.adminUsers && this.state.adminUsers.length !== 0 ? this.state.adminUsers.map((user) =>
                <div>
                  <ListItem secondaryAction={
                    <Tooltip title="More">
                    <IconButton onClick={(event) => {
                      let data = this.state;
                      data.adminUserOpen = true;
                      data.adminUserAnchorEl = event.currentTarget;
                      data.adminUserSelected = user;
                      this.setState(data);
                    }
                    } edge='end' aria-label='comments'>
                      <MoreVert />
                    </IconButton>
                    </Tooltip>
                  }>
                    <Menu
                      id='fade-menu'
                      anchorEl={this.state.adminUserAnchorEl}
                      anchorOrigin={{
                        vertical: 'bottom', horizontal: 'center'
                      }}
                      transformOrigin={{
                        vertical: 'top', horizontal: 'center'
                      }}
                      open={this.state.adminUserOpen}
                      onClose={() => {
                        let data = this.state;
                        data.adminUserOpen = false;
                        data.adminUserAnchorEl = null;
                        data.adminUserSelected = null;
                        this.setState(data);
                      }}
                      autoFocus={false}
                    >
                      <MenuItem
                        onClick={() => {
                          let data = this.state;
                          data.adminUserOpen = false;
                          data.adminUserAnchorEl = null;
                          this.setState(data);
                          this.userManager.deleteUser(this.state.adminUserSelected.uid, (result) => {
                            if (result) {
                              this.showSuccessSnackbar(t('user_delete_success'));
                              this.userManager.loadUsers(1, (result) => {
                                let data = this.state;
                                data.adminUsers = result;
                                data.adminUserSelected = null;
                                this.setState(data);
                              });
                            } else {
                              this.showErrorSnackbar(t('user_delete_failed'));
                            }
                          });
                        }}
                      >
                        <ListItemIcon>
                          <Delete
                            fontSize='small'
                            style={{ fill: 'black' }}
                          />
                        </ListItemIcon>
                        {t('delete')}
                      </MenuItem>
                      <MenuItem
                        onClick={() => {
                          let data = this.state;
                          data.adminUserOpen = false;
                          data.adminUserAnchorEl = null;
                          this.setState(data);
                          this.userManager.promoteUser(this.state.adminUserSelected.uid, !((this.state.adminUserSelected && this.state.adminUserSelected.customClaims) ? this.state.adminUserSelected.customClaims.admin : false), (result) => {
                            if (result) {
                              this.showSuccessSnackbar(t('user_promot_success'));
                              data.adminUserSelected = null;
                            } else {
                              this.showErrorSnackbar(t('promote_user_failed'));
                            }
                          });
                        }}
                      >
                        <ListItemIcon>
                          <AddModerator
                            fontSize='small'
                            style={{ fill: 'black' }}
                          />
                        </ListItemIcon>
                        {((this.state.adminUserSelected && this.state.adminUserSelected.customClaims) ? this.state.adminUserSelected.customClaims.admin : false) ? t('demote_admin') : t('promote_to_admin')}
                      </MenuItem>
                    </Menu>
                    <ListItemButton
                      style={{ borderRadius: '5px' }} dense>
                      <ListItemIcon>
                        <Avatar
                          sx={{
                            width: 48, height: 48, bgcolor: "linear-gradient(-180deg, " + hexToRgb(this.state.userSettingsThemeColor) + " 0%, " + hexToRgb(shadeColor(this.state.userSettingsThemeColor, -40)) + " 85%)"
                          }}
                          style={{
                            marginBottom: '10px', marginTop: '24px', marginRight: '10px'
                          }}
                        >
                          {user.displayName.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText primary={user.displayName}
                                    secondary={user.email ? user.email : ''} />
                    </ListItemButton>
                  </ListItem>
                  <Divider variant='middle' />
                </div>
              ) : <div></div>}
            </List>
          </nav>
        </Box>
      </td>
    </tr>;
  }

  openProject(project, background, callback) {
    console.log('openProject', project);
    const {t} = this.props
    background = background || false;
    let data = this.state;
    if (!background) {
      data.loadingProject = true;
    }
    this.setState(data);
    this.projectManager.loadProjectInformation(project._id, (status, projectBlob) => {
      if (status === 200) {
        this.currentProjectBlob = projectBlob;
        JSZip.loadAsync(projectBlob).then(async (zip) => {
          let file;
          let libraries = [];

          for (let [filename] of Object.entries(zip.files)) {
            if (filename.startsWith('aiwebres/') && filename !== 'aiwebres/') {
              file = filename;
              break;
            }
          }

          for (let [filename] of Object.entries(zip.files)) {
            console.log(filename);
            if (filename.startsWith('libraries/') && filename !== 'libraries/') {
              libraries.push(filename);
            }
          }

          let icon;
          if (file) {
            icon = await zip.files[file].async('blob');
          }
          let librariesFiles = [];
          if (file) {
            for (let i = 0; i < libraries.length; i++) {
              librariesFiles.push(await zip.files[libraries[i]].async('blob'));
            }
          }
          console.log(icon);
          console.log(librariesFiles);
          let data = this.state;
          data.projectIconBlob = icon;
          data.projectLibrariesBlob = librariesFiles;
          this.setState(data);
          let blocks;
          JSZip.loadAsync(projectBlob).then((zip) => {
            return zip.files['extension.json'].async('text');
          }).then((extensionJsonText) => {
            let project_ = JSON.parse(extensionJsonText);
            JSZip.loadAsync(projectBlob).then((zip) => {
              return zip.files['src/main/blocks/' + project_.name + '.xml'].async('text');
            }).then((projectBlocks) => {
              console.log("projblocks", projectBlocks)
              project_.blocks = projectBlocks;
              blocks = projectBlocks;
              JSZip.loadAsync(projectBlob).then((zip) => {
                return zip.files['AndroidManifest.xml'].async('text');
              }).then((androidManifest) => {
                console.log('manifesT', androidManifest);
                project_.androidManifest = androidManifest;
                JSZip.loadAsync(projectBlob).then((zip) => {
                  return zip.files['classes.json'].async('text');
                }).then((classesJson) => {
                  project_.classes = JSON.parse(classesJson).classes;
                  if (!project_.classes) { // need to unescape
                    project_.classes = JSON.parse(JSON.parse(unescape(classesJson))).classes
                  }
                  console.log(project_);
                  project_._id = project._id;

                  project = project_;
                  // unload previous workspace
                  if (this.blocklyWorkspace) {
                    this.blocklyWorkspace.disposeBlocklyWorkspace();
                    this.blocklyWorkspace = null;
                  }
                  let data = this.state;
                  if (!background) {
                    data.currentProject = project_;
                  }
                  console.log(project_);
                  this.blocklyWorkspace = new BlocklyWorkspace(project_, this.state.projectIconBlob, this.state.projectLibrariesBlob, this.projectManager, this.userManager.getUser());
                  console.log(data);
                   isFirstTime = true;
                  this.setState(data, () => this.blocklyWorkspace.injectBlocklyWorkspace(() => {
                    if (isFirstTime) {
                      isFirstTime = false;
                      let newProject = project;
                      console.log("blockks", blocks)
                      newProject.blocks = blocks;
                      data = this.state;
                      if (!background) {
                        data.currentProject = newProject;
                      }
                      this.blocklyWorkspace.updateWorkspaceBlocks(newProject.blocks)
                      data.loadingProject = false;
                      this.setState(data);
                      if (callback) {
                        callback(newProject);
                      }
                    }
                  }));
                });
              });
            });
          });
        });
      } else if (status === 401) {
        this.showSessionExpiredDialog()
      } else {
        let data = this.state;
        data.loadingProject = false;
        this.setState(data)
        this.showErrorSnackbar(t('server_encountered_error_status') + status);
      }
    });
  }

  handleMyProjectsMenuItem() {
    this.handleProjectMenuClose();
    let data = this.state;
    data.currentProject = undefined;
    this.setState(data, () => {
      if (this.blocklyWorkspace) {
        this.blocklyWorkspace.disposeBlocklyWorkspace();
        this.blocklyWorkspace = null;
      }
    });
  }

  processImportedFiles(files, import_) {
    const { t } = this.props;
    console.log(files);
    const file = files instanceof FileList ? files[0] : files; // we currently only support one file per every import
    console.log(this.getFileExtension(file.name));
    if (this.getFileExtension(file.name) !== 'rbx') {
      this.showErrorSnackbar(t('file_not_project_file'));
    } else {
      let extensionJson;
      JSZip.loadAsync(file)
        .then((content) => {
          // if you return a promise in a "then", you will chain the two promises
          return content.files['extension.json'].async('text');
        })
        .then((extensionJsonContent) => {
          extensionJson = JSON.parse(extensionJsonContent);
          let zipp;
          JSZip.loadAsync(file)
            .then((zip) => {
              zipp = zip;
              return zip.files['src/main/blocks/' + extensionJson.name + '.xml'].async('text');
            })
            .then((blocksXml) => {
              extensionJson.blocks = blocksXml;
              return zipp.files['classes.json'].async('text');
            })
            .then((classes) => {
              extensionJson.classes = JSON.parse(classes).classes;
              if (!import_) {
                console.log(extensionJsonContent);
                const description = extensionJson.description ? extensionJson.description : '';
                let data = this.state;
                data.fileSelected = file;
                data.fileSelectedName = extensionJson.name;
                data.fileSelectedDescription = description;
                this.setState(data);
              } else {
                console.log('Json content: ' + extensionJsonContent);
                console.log('Json ', extensionJson);
                this.blocklyWorkspace = new BlocklyWorkspace(extensionJson, this.state.projectIconBlob, this.state.projectLibrariesBlob, this.projectManager, this.userManager.getUser());
                this.projectManager.importProject(extensionJson, this.blocklyWorkspace, this.state.projectIconBlob, this.state.projectLibrariesBlob, (statusCode, project) => {
                  if (statusCode === 200) {
                    this.projectToLoad = project;
                    this.loadProjects();
                    let data = this.state;
                    data.projects = undefined;
                    this.setState(data);
                  } else if (statusCode === 409) {
                    this.showErrorSnackbar(t('project_same_name_exists'));
                  } else if (statusCode === 402) {
                    this.showErrorSnackbar(t('number_of_projects_exceeded'));
                  } else if (statusCode === 413) {
                    this.showErrorSnackbar(t('cloud_storage_limit_exceeded'));
                  } else if (statusCode === 401) {
                    this.showSessionExpiredDialog()
                  } else {
                    this.showErrorSnackbar(t('server_encountered_error_status') + statusCode);
                  }
                });
                this.handleCloseImportFileDialog();
              }
            });
        });
    }
  }

  processImportedLibraries(files, import_) {
    console.log(files);
    const {t} = this.props
    const file = files instanceof FileList ? files[0] : files; // we currently only support one file per every import
    console.log(this.getFileExtension(file.name));
    if (this.getFileExtension(file.name) !== 'jar') {
      this.showErrorSnackbar(t('file_not_library_file'));
    } else {
      let data = this.state;
      data.fileSelected = file;
      data.fileSelectedName = file.name;
      data.fileSelectedDescription = "";
      this.setState(data);
      if (import_) {
        let data = this.state;
        data.projectLibrariesBlob.push(file);
        this.setState(data);
        let newProject = this.state.currentProject;
        newProject.libraries.push(file.name);
        this.projectManager.updateProject(newProject, this.state.projectIconBlob, this.blocklyWorkspace, this.state.projectLibrariesBlob, (status) => {
          if (status === 200) {
            this.showSuccessSnackbar(t('library_upload_success'))
          } else if (status === 403) {
            this.showSessionExpiredDialog()
          } else if (status === 413) {
            this.showErrorSnackbar(t('cloud_storage_limit_exceeded'))
          } else {
            this.showErrorSnackbar(t('library_upload_failed'))
          }
        })
      }
    }
  }

  getFileExtension(filename) {
    const ext = /^.+\.([^.]+)$/.exec(filename);
    return ext == null ? '' : ext[1];
  }

  handleSaveProjectMenuItem() {
    const { t } = this.props
    this.handleProjectMenuClose();
    if (this.projectManager) {
      this.projectManager.updateProject(this.state.currentProject, this.state.projectIconBlob, this.blocklyWorkspace, this.projectLibrariesBlob, (status) => {
        if (status === 200) {
          const currentDate = new Date();
          const formatter = new Intl.DateTimeFormat("en-GB", { // <- re-use me
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
          })
          this.showSuccessSnackbar(t('project_saved_at') + formatter.format(currentDate) + ' ' + currentDate.getHours() + ':' + currentDate.getMinutes() + ':' + currentDate.getSeconds());
        } else if (status === 401) {
          this.showSessionExpiredDialog()
        } else if (status === 413) {
          this.showErrorSnackbar(t('cloud_storage_limit_exceeded'))
        } else {
          this.showErrorSnackbar(t('project_save_failed'));
        }
      });
    }
  }

  openImportClassDialog() {
    let data = this.state;
    data.importClassDialogOpen = true;
    this.setState(data);
  }

  openNewVariableDialog() {
    let data = this.state;
    data.newVariableDialogOpen = true;
    this.setState(data);
  }

  loadClassesData(filter) {
    const { t } = this.props
    this.blocklyWorkspace.createProjectFile(this.state.currentProject, this.state.projectIconBlob, this.state.projectLibrariesBlob, (content) => {
      const fd = new FormData();
      fd.append('input', content);
      $.ajax(BUILD_SERVER_URL + `/classes/${filter}`, {
        type: 'POST', data: fd, processData: false, contentType: false, headers: {
          "X-api-key": this.userManager.userToken
        }, success: (result) => {
          let parsedResult = JSON.parse(result);
          console.log(parsedResult);
          let data = this.state;
          data.classesData = parsedResult;
          this.setState(data);
        }, fail: (jqXHR, b, status) => {
          if (jqXHR.status === 429) {
            this.showErrorSnackbar(t('buildserver_quota_exhausted') + jqXHR.getResponseHeader("X-Rate-Limit-Retry-After-Seconds") + " seconds.")
          } else {
            this.showErrorSnackbar(t('buildserver_down'));
          }
        }
      });
    });
  }

  handleCloseImportClassDialog() {
    this.lastFetchedClassesNum = 0;
    let data = this.state;
    data.importClassDialogOpen = false;
    data.classesData = undefined;
    this.setState(data);
  }

  buildProject(type) {
    const {t} = this.props;
    let data = this.state;
    data.buildingProject = true;
    data.buildingStatus = 'Connecting to BuildServer (0%)';
    this.setState(data);
    this.blocklyWorkspace.createProjectFile(this.state.currentProject, this.state.projectIconBlob,  this.state.projectLibrariesBlob, (content) => {
      const fd = new FormData();
      fd.append('input', content);
      $.ajax({
        type: 'POST', url: BUILD_SERVER_URL + '/build/' + type, headers: {
          "X-api-key": this.userManager.userToken
        }, data: fd, timeout: 15000, processData: false, contentType: false
      })
        .done((data) => {
          const json = JSON.parse(data);
          let intervalId = null;
          const fun = () => {
            $.ajax({
              type: 'GET',
              url: BUILD_SERVER_URL + '/build/status/' + json.id,
              data: fd,
              headers: {
                "X-api-key": this.userManager.userToken
              },
              timeout: 15000,
              processData: false,
              contentType: false
            })
              .done((data2) => {
                const dataJson = JSON.parse(data2);
                if (dataJson.success && dataJson['downloadUrl']) {
                  this.projectDownloadLink = dataJson['downloadUrl'];
                  let newState = this.state;
                  newState.buildingProject = false;
                  newState.projectBuiltDialogOpen = true;
                  this.setState(newState);
                  window.clearInterval(intervalId);
                } else {
                  let data = this.state;
                  data.buildingStatus = dataJson['status'];
                  this.setState(data);
                }
                if (dataJson['done'] && !dataJson.success) {
                  let newState = this.state;
                  newState.buildingProject = false;
                  newState.projectBuildFailedDialog = true;
                  newState.projectErrors = dataJson['errors'];
                  this.setState(newState);
                  window.clearInterval(intervalId);
                }
                console.log(dataJson);
              });
          };
          intervalId = window.setInterval(fun, 1000);
        })
        .fail((jqXHR, textStatus, error) => {
          let newState = this.state;
          newState.buildingProject = false;
          this.setState(newState);
          console.log(jqXHR.getAllResponseHeaders())
          if (jqXHR.status === 429) {
            this.showErrorSnackbar(t('buildserver_quota_exhausted') + (Number.parseInt(jqXHR.getResponseHeader("X-Rate-Limit-Retry-After-Seconds"))) / 60 + " minutes.")
          } else {
            this.showErrorSnackbar(t('buildserver_down'));
          }
        });
    });
  }

  isPackageNameValid(packageName) {
    return /(^[a-z_]+(?:\d*[a-zA-Z_]*)*)(?:\.[a-z_]+(?:\d*[a-zA-Z_]*)*)*$/.test(packageName);
  }

  isClassNameValid(className) {
    return (!/^\d/.test(className) && /^[A-Z][A-Za-z]*$/.test(className));
  }

  handleSaveProjectSettings() {
    const {t} = this.props
    let newProject = this.state.currentProject;
    let newDescription = this.state.projectOptionsProjectDescription;
    if (newDescription !== undefined && this.projectSettingChanged('description', newDescription)) {
      newProject.description = newDescription.replaceAll('\n', '<br>');
    }
    let newVersionName = this.state.projectOptionsVersionName;
    if (newVersionName && this.projectSettingChanged('versionName', newVersionName)) {
      newProject.versionName = newVersionName;
    }
    let newVersionNumber = this.state.projectOptionsVersionNumber;
    if (newVersionNumber && this.projectSettingChanged('versionNumber', newVersionNumber)) {
      if (newVersionNumber.trim().length === 0 || !/^\d+$/.test(newVersionNumber)) {
        this.showErrorSnackbar(t('version_number_invalid'));
        return;
      }
      newProject.versionNumber = newVersionNumber;
    }
    let newHomePageWebsite = this.state.projectOptionsHomeWebsite;
    if (newHomePageWebsite && this.projectSettingChanged('homeWebsite', newHomePageWebsite)) {
      if (!this.isValidUrl(newHomePageWebsite)) {
        this.showErrorSnackbar(t('home_website_invalid'));
        return;
      }
      newProject.homeWebsite = newHomePageWebsite;
    }
    let newMinSdk = this.state.projectOptionsMinSdk;
    if (newMinSdk && this.projectSettingChanged('minSdk', newMinSdk)) {
      newProject.minSdk = newMinSdk.api;
    }
    let newProguard = this.state.projectOptionsProguard;
    console.log(newProguard);
    if (newProguard !== undefined && this.projectSettingChanged('proguard', newProguard)) {
      newProject.proguard = newProguard;
    }
    let newAutoIncrement = this.state.projectOptionsAutoIncrement;
    console.log(newAutoIncrement);
    if (newAutoIncrement !== undefined && this.projectSettingChanged('autoIncrement', newAutoIncrement)) {
      newProject.autoIncrement = newAutoIncrement;
    }
    let newIcon = this.state.projectOptionsIcon;
    console.log(newIcon);
    if (newIcon !== undefined && this.projectSettingChanged('icon', newIcon)) {
      newProject.icon = newIcon;
    }
    let newAndroidManifest = this.state.projectOptionsAndroidManifest;
    if (newAndroidManifest !== undefined && this.projectSettingChanged('androidManifest', newIcon)) {
      newProject.androidManifest = newAndroidManifest;
    }
    console.log(newProject);
    if (newProject) {
      this.projectManager.updateProject(newProject, this.state.projectOptionsIconBlob, this.blocklyWorkspace, this.state.projectLibrariesBlob,(status) => {
        console.log(status);
        if (status === 200) {
          let data = this.state;
          data.currentProject = newProject;
          // so we don't use this value in the future.
          data.projectOptionsProjectDescription = newProject.description;
          data.projectOptionsVersionName = newProject.versionName;
          data.projectOptionsVersionNumber = newProject.versionNumber;
          data.projectOptionsHomeWebsite = newProject.homeWebsite;
          data.projectOptionsMinSdk = this.getObjectByApi(newProject.minSdk);
          data.projectOptionsIcon = newProject.icon;
          data.projectOptionsProguard = newProject.proguard;
          data.projectOptionsAutoIncrement = newProject.autoIncrement;
          data.projectOptionsAndroidManifest = newProject.androidManifest;
          data.projectIconBlob = this.state.projectOptionsIconBlob;
          this.setState(data, () => {
            this.showSuccessSnackbar(t('project_settings_updated'));
            this.handleCloseProjectOptionsDialog();
          });
        } else {
          let data = this.state;
          data.projectOptionsProjectDescription = this.state.currentProject.description;
          data.projectOptionsVersionName = this.state.currentProject.versionName;
          data.projectOptionsVersionNumber = this.state.currentProject.versionNumber;
          data.projectOptionsHomeWebsite = this.state.currentProject.homeWebsite;
          data.projectOptionsMinSdk = this.getObjectByApi(this.state.currentProject.minSdk);
          data.projectOptionsProguard = this.state.currentProject.proguard;
          data.projectOptionsAutoIncrement = this.state.currentProject.autoIncrement;
          data.projectOptionsIcon = this.state.currentProject.icon;
          data.projectOptionsAndroidManifest = this.state.currentProject.androidManifest;
          data.projectOptionsIconBlob = this.state.projectIconBlob;
          this.setState(data, () => {
            if (status === 409) {
              this.showErrorSnackbar(t('project_same_name_exists'));
            } else if (status === 401) {
              this.showSessionExpiredDialog()
            } else if (status === 413) {
              this.showErrorSnackbar(t('cloud_storage_limit_exceeded'))
            } else {
              this.showErrorSnackbar(t('project_settings_failed'));
            }
          });
        }
      });
    }
  }

  projectSettingChanged(settingName, value) {
    return (this.state.currentProject[settingName] !== value);
  }

  renderLoadingProject() {
    if (!this.state.projects) {
      return (<tr>
        <td id={'loading-project'}>
          <CircularProgress />
        </td>
      </tr>);
    } else {
      return <div />;
    }
  }

  renderProjectsView() {
    const { t } = this.props;
    if (!this.state.currentProject) {
      return (<table id={'projects-view'}>
        <tbody>
        {this.renderLoadingProject()}
        <tr
          id='no-projects'
          style={this.state.projects && this.state.projects.length === 0 ? {
            display: 'table-row'
          } : { display: 'none' }}
        >
          <td
            style={{
              textAlign: '-webkit-center'
            }}
          >
            <Lottie
              loop
              animationData={welcomeLottieJson}
              play
              style={{
                height: 250, marginBottom: '-51px'
              }}
            />
            <h3
              style={{
                fontFamily: 'Roboto-Regular'
              }}
            >
              {t('welcome_to_rapid')}
            </h3>
            <p
              style={{
                fontFamily: 'Roboto-Regular'
              }}
            >
              {t('no_projects')}
            </p>
            <Button
              onClick={() => this.openNewProjectDialog()}
              variant={'outlined'}
              startIcon={<Add />}
            >
              {t('create_new_project')}
            </Button>
          </td>
        </tr>
        {this.state.projects && this.state.projects.length !== 0 && this.displayListView()}
        </tbody>
      </table>);
    } else {
      return <div />;
    }
  }


  isValidUrl(url) {
    return /^(?:(?:https?|ftp):)?\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4])|[a-z\u00a1-\uffff\d-*)*[a-z\u00a1-\uffff0-9]+(?:\.(?:[a-z\u00a1-\uffff\d]-*)*[a-z\u00a1-\uffff\d]+)*\.[a-z\u00a1-\uffff]{2,})(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(url);
  }

  getObjectByApi(api) {
    for (let index in androidSdks) {
      let obj = androidSdks[index];
      if (obj.api === api) {
        return obj;
      }
    }
  }

  handleCloseExportProjectDialog(import_) {
    let data = this.state;
    data.exportProjectDialogOpen = false;
    this.setState(data);
    if (import_) {
      this.doExportSelectedProjects(true, this.state.exportAsZipRadioChecked);
    }
  }

  showSuccessSnackbar(message) {
    let data = this.state;
    data.successSnackbarMessage = message;
    this.setState(data);
  }

  showErrorSnackbar(message) {
    let data = this.state;
    data.errorSnackbarMessage = message;
    this.setState(data);
  }

  loadClassInfo(className, opt_implement) {
    const {t} = this.props
    opt_implement = opt_implement || false
    let data = this.state;
    data.importingClass = true;
    this.setState(data);
    this.blocklyWorkspace.createProjectFile(this.state.currentProject, this.state.projectIconBlob, this.state.projectLibrariesBlob, (content) => {
      const fd = new FormData();
      fd.append('input', content);
      $.ajax(BUILD_SERVER_URL + '/class/' + className,  {
        type: 'POST', data: fd, processData: false, contentType: false, headers: {
          "X-api-key": this.userManager.userToken
        }, success: (result) => {
          console.log(result);
          let classObj = JSON.parse(result);
          if (opt_implement) {
            this.blocklyWorkspace.implementInterface(this.state.currentProject, classObj, () => {
              let data = this.state;
              data.importingClass = false;
              this.setState(data);
            });
          } else {
            this.blocklyWorkspace.importClass(this.state.currentProject, classObj, () => {
              let data = this.state;
              data.importingClass = false;
              this.setState(data);
            });
          }
        }, fail: (jqXHR, a,b) => {
          if (jqXHR.status === 429) {
            this.showErrorSnackbar(t('buildserver_quota_exhausted') + jqXHR.getResponseHeader("X-Rate-Limit-Retry-After-Seconds") + " seconds.")
          } else {
            this.showErrorSnackbar(t('buildserver_down'));
          }
        }
      });
    });
  }

  resolveLibraries(libraryName) {
    const {t} = this.props
    this.blocklyWorkspace.createProjectFile(this.state.currentProject, this.state.projectIconBlob, this.state.projectLibrariesBlob, (content) => {
      const fd = new FormData();
      fd.append('input', content);
      $.ajax(BUILD_SERVER_URL + '/library/resolve?dependency=' + libraryName,  {
        type: 'POST', data: fd, processData: false, contentType: false, headers: {
          "X-api-key": this.userManager.userToken
        }, xhr: function () {// Seems like the only way to get access to the xhr object
          var xhr = new XMLHttpRequest();
          xhr.responseType = 'blob'
          return xhr;
        }, success: (result) => {
          JSZip.loadAsync(result).then((r) => {
            return r.file("extension.json").async("text")
          }).then((extensionJson) => {
            this.projectManager.updateProjectByBlob(this.state.currentProject._id, result, (status) => {
              if (status === 200) {
                let data = this.state;
                var newProject = data.currentProject;
                newProject.libraries = JSON.parse(extensionJson).libraries;
                newProject.currentProjectBlob = result;
                data.currentProject = newProject;
                this.setState(data)
                this.showSuccessSnackbar(t('library_resolve_success'))
                window.location.reload()
              } else if (status === 413) {
                this.showErrorSnackbar(t('cloud_storage_limit_exceeded'))
              } else if (status === 403) {
                this.showSessionExpiredDialog()
              } else {
                this.showErrorSnackbar(t('library_resolve_failed'))
              }
            })
          })

        }, error: (error) => {
          console.log(error);
          if (error.status === 429) {
            this.showErrorSnackbar(t('buildserver_quota_exhausted') + error.getResponseHeader("X-Rate-Limit-Retry-After-Seconds") + " seconds.")
          } else if (error.status === 402) {
            this.showErrorSnackbar(t('library_resolution_unsupported'))
          } else {

            this.showErrorSnackbar(t('library_resolve_failed'))
          }
        }
      });
    });
  }

  renderClassesData() {
    const {t} = this.props;
    if (this.state.classesData) {
      return (
        <div style={{textAlign: "center", width: "100%", height: "100%"}}>{this.state.classesData && this.state.classesData.length ? (<Grid
        container
        rowSpacing={1}
        columnSpacing={{
          xs: 1, sm: 2, md: 3
        }}
      >{this.state.classesData.map((item) =>
          (<Grid item xs={3}>
          <Card
            sx={{ minWidth: 275 }}
            variant={'outlined'}
            id={JSON.stringify(item)}
          >
            <CardActionArea>
              <CardContent>
                <div
                  style={{
                    display: 'flex', verticalAlign: 'middle', marginBottom: '16px', alignItems: 'center'
                  }}
                >
                  <Avatar
                    sx={{
                      background: "linear-gradient(-180deg, " + hexToRgb(getColorByClassType(item.type)) + " 0%, " + hexToRgb(shadeColor(getColorByClassType(item.type), -40)) + " 85%)",
                      width: 60,
                      height: 60,
                      fontSize: '35px',
                      marginRight: '10px'
                    }}
                  >
                    {item.type === 'class' ? 'C' : item.type === 'interface' ? 'I' : 'E'}
                  </Avatar>
                  <Typography
                    noWrap
                    variant='h6'
                    component='div'
                  >
                    {item.simpleName}
                  </Typography>
                </div>
                <Typography
                  noWrap
                  sx={{
                    fontSize: 14
                  }}
                  color='text.secondary'
                  gutterBottom
                >
                  {item.name}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(item);
                    this.handleCloseImportClassDialog();
                    this.loadClassInfo(item.name);
                  }}
                  startIcon={<Upload />}
                  size='small'
                >
                  {t('import')}
                </Button>
                {item.type === "interface" ? <Button
                  onClick={(e) => {
                    e.stopPropagation();
                    console.log(item);
                    this.handleCloseImportClassDialog();
                    this.loadClassInfo(item.name, true);
                  }}
                  startIcon={<Add />}
                  size='small'
                >
                  {t('implement')}
                </Button> : ''}
              </CardActions>
            </CardActionArea>
          </Card></Grid>))}</Grid>) : (<div><Lottie loop
            animationData={searchNotFoundLottieJson}
            play
            style={{
              height: 250, marginBottom: '-20px'
            }}
          />
          <h3>{t('no_classes_found')}</h3></div>)}
          </div>);
    } else {
      return (
        <div style={{textAlign: "center", height:"100%", width: "100%"}}><p>{t('search_class_instruct')}</p></div>);
    }
  }

  handleChangeComplete(color) {
    let data = this.state;
    data.userSettingsThemeColor = color.hex;
    this.setState(data);
  }

  handleOpenColorPicker(event) {
    let data = this.state;
    data.colorPickerAnchorEl = event.currentTarget;
    this.setState(data);
  }

  handleCloseColorPicker() {
    let data = this.state;
    data.colorPickerAnchorEl = null;
    this.setState(data);
  }

  openUploadFile() {
    this.uploadProjectFileInput.click();
    this.uploadProjectFileInput.onchange = () => {
      var fileList = this.uploadProjectFileInput.files;
      console.log(fileList);
      const config = {
        quality: 0.5,
        maxWidth: 16,
        maxHeight: 16,
        debug: true
      };

      readAndCompressImage(fileList[0], config)
        .then(resizedImage => {
          let data = this.state;
          data.projectOptionsIcon = fileList[0].name;
          data.projectOptionsIconBlob = resizedImage;
          this.setState(data);
        });
    };
  }

  setSortMenuAnchorEl(el, sortEnum) {
    let data = this.state;
    data.sortMenuAnchorEl = el;
    data.sortMenuOpen = Boolean(el);
    if (sortEnum) {
      data.sortBy = sortEnum;
      this.doSortProjects(this.state.projects);
    }
    this.setState(data);
  }

  doSortProjects(projects) {
    let comparator = undefined;
    if (this.state.sortBy === this.sortByEnum.NAME_ASCENDING) {
      comparator = (a, b) => a.name.localeCompare(b.name);
    } else if (this.state.sortBy === this.sortByEnum.NAME_DESCENDING) {
      comparator = (a, b) => b.name.localeCompare(a.name);
    } else if (this.state.sortBy === this.sortByEnum.DATE_CREATED_ASCENDING) {
      comparator = (a, b) => new Date(a.createdAt) - new Date(b.createdAt);
    } else if (this.state.sortBy === this.sortByEnum.DATE_CREATED_DESCENDING) {
      comparator = (a, b) => new Date(b.createdAt) - new Date(a.createdAt);
    } else if (this.state.sortBy === this.sortByEnum.DATE_MODIFIED_ASCENDING) {
      comparator = (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt);
    } else if (this.state.sortBy === this.sortByEnum.DATE_MODIFIED_DESCENDING) {
      comparator = (a, b) => new Date(a.updatedAt) - new Date(b.updatedAt);
    }
    const sortedProjects = projects.sort(comparator);
    let data = this.state;
    data.projects = sortedProjects;
    this.setState(data);
  }

  renderSubscribeButton(planType) {
    const {t} = this.props
    if (planType === this.plan ) {
      return <Button fullWidth style={{ position: "absolute", height: "45px", bottom: 0, right: 0 }} disabled
                     startIcon={<Check />}>Selected</Button>
    } else if (planType === "free") {
      return <Button fullWidth style={{ position: "absolute", height: "45px", bottom: 0, right: 0 }} disabled>{t('select')}</Button>
    } else {
      return <LoadingButton loading={this.state.creatingCheckOut === planType} onClick={() => {
        let data = this.state;
        data.creatingCheckOut = planType;
        this.setState(data);
        this.userManager.createCheckoutSession(planType, (response) => {
          let data = this.state;
          data.creatingCheckOut = undefined;
          this.setState(data);
          window.open(response, "_blank")
        })
      }
      } fullWidth style={{position: "absolute", height: "45px", bottom: 0, right: 0}} variant="contained">{t('select')}</LoadingButton>
    }
  }
}

function shadeColor(color, percent) {


  var R = parseInt(color.substring(1,3),16);
  var G = parseInt(color.substring(3,5),16);
  var B = parseInt(color.substring(5,7),16);

  R = parseInt(R * (100 + percent) / 100);
  G = parseInt(G * (100 + percent) / 100);
  B = parseInt(B * (100 + percent) / 100);

  R = (R<255)?R:255;
  G = (G<255)?G:255;
  B = (B<255)?B:255;

  var RR = ((R.toString(16).length===1)?"0"+R.toString(16):R.toString(16));
  var GG = ((G.toString(16).length===1)?"0"+G.toString(16):G.toString(16));
  var BB = ((B.toString(16).length===1)?"0"+B.toString(16):B.toString(16));

  return "#"+RR+GG+BB;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(rgb) {
  rgb = rgb.replaceAll("rgb(", "").replaceAll(")", "")
  var r = rgb.substring(1,3);
  var g = rgb.substring(3,5);
  var b = rgb.substring(5,7);
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? ("rgb("+
    parseInt(result[1], 16) + "," +
    parseInt(result[2], 16) + "," +
    parseInt(result[3], 16)  + ")"): null;
}

function getColorByClassType(type) {
  return type === 'class' ? '#3e8fa0' : type === 'interface' ? '#407d41' : '#3e8fa0'
}

function TabPanel(props) {
  const {
    children, value, index, ...other
  } = props;

  return (<div
    role='tabpanel'
    hidden={value !== index}
    id={`simple-tabpanel-${index}`}
    aria-labelledby={`simple-tab-${index}`}
    {...other}
  >
    {value === index && (<Box sx={{ p: 1.5 }}>
      {children}
    </Box>)}
  </div>);
}

TabPanel.propTypes = {
  children: PropTypes.node, index: PropTypes.string.isRequired, value: PropTypes.number.isRequired
};

export default withTranslation()(App);
