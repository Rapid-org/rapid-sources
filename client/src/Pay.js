import React from "react";
import logo from "./logo.png";
import {ThemeProvider} from "@mui/material/styles";
import {Button, createTheme} from "@mui/material";
import './NotFound.css';

class NotFound extends React.Component {
    render() {
      const sessionId = new URLSearchParams(window.location.search).get("session_id")
      const cancelled = new URLSearchParams(window.location.search).get("cancelled")
      const successFull = sessionId && sessionId.length && cancelled !== "true"
        const theme = createTheme({
            palette: {
                primary: {
                    main: '#6200ee'
                }
            },
        });
        return (<ThemeProvider theme={theme}>
            <div className={"centered-not-found"}><img style={{width: "120px", height: "120px"}} src={logo}
                                                     alt={"logo"}/><h2>{successFull ? "Payment Succeeded" : (cancelled === "true" ? "Payment Cancelled" : "Payment Failed")}</h2><p
                style={{color: "#2d2c2c"}}>{successFull ? "You have been subscribed to Rapid successfully!" : (cancelled === "true" ? "Payment has been cancelled by user." : "Payment failed for an unknown reason.")}</p>
              <Button onClick={() => window.location.replace("/")} variant={"contained"}>Back To Home</Button>
              </div>
        </ThemeProvider>);
    }
}

export default NotFound;
