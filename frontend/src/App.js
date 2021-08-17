import React, { Component } from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Redirect,
  Route,
  Switch,
} from "react-router-dom";
import AuthPage from "./pages/Auth";
import BookingsPage from "./pages/Bookings";
import EventPage from "./pages/Events";
import MainNavigation from "./components/navigation/MainNavigation";

import AuthContext from "./context/auth-context";

class App extends Component {
  state = {
    token: null,
    userId: null,
  };

  login = (token, userId, tokenExpiration) => {
    this.setState({ token: token, userId: userId });
  };

  logout = () => {
    this.setState({ userId: null, token: null });
  };

  render() {
    return (
      <Router>
        <AuthContext.Provider
          value={{
            token: this.state.token,
            userId: this.state.userId,
            login: this.login,
            logout: this.logout,
          }}
        >
          <MainNavigation />
          <main className="main-content">
            <Switch>
              {this.state.token && <Redirect from="/" to="/events" exact />}
              {this.state.token && <Redirect from="/auth" to="/events" exact />}

              {!this.state.token && (
                <Route path="/auth">
                  <AuthPage />
                </Route>
              )}
              <Route path="/events">
                <EventPage />
              </Route>
              {this.state.token && (
                <Route path="/bookings">
                  <BookingsPage />
                </Route>
              )}
              {!this.state.token && <Redirect to="auth" exact />}
            </Switch>
          </main>
        </AuthContext.Provider>
      </Router>
    );
  }
}
export default App;
