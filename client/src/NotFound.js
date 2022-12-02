import React from "react";
import logo from "./logo.png";
import {ThemeProvider} from "@mui/material/styles";
import {Button, createTheme} from "@mui/material";
import './NotFound.css';

class NotFound extends React.Component {
    render() {
        const theme = createTheme({
            palette: {
                primary: {
                    main: '#6200ee'
                }
            },
        });
        return (<ThemeProvider theme={theme}>
            <div className={"centered-not-found"}><img style={{width: "120px", height: "120px"}} src={logo}
                                                     alt={"logo"}/><h2>404 - Not Found!</h2><p
                style={{color: "#2d2c2c"}}>We can't find the page your are looking for.</p><Button onClick={() => window.location.replace("/client")} variant={"contained"}>Rapid Client</Button> </div>
        </ThemeProvider>);
    }
}

export default NotFound;