import React, { Component } from "react";
import autobind from "autobind-decorator";
import SocketIOClient from "socket.io-client";

import "reset-css";
import "./App.css";

class App extends Component {
  state = {
    databaseURL: "asd",
    incompleteDatabaseURL: "",
    isEditingDatabaseURL: false,
    services: {
      "accounts-api@1.0.1": {
        "0.0.0.0:80": true,
        "0.0.0.0:81": true,
      },
      "auth-api@1.0.0": {
        "0.0.0.0:83": true,
      },
      "product-feature-api@2.5.1": {
      },
    },
    selectedService: "auth-api@1.0.0",
  }
  
  componentDidMount() {
    const socket = SocketIOClient();
    socket.on("sadd", (serviceKey, url) => {
      
    });
    socket.on("set", (aliveKey, alive, _, expiry) => {
      
    });
  }
  
  editDatabaseURL(e) {
    this.setState({
      isEditingDatabaseURL: true,
    });
  }
  
  setVascoDatabaseURL(e) {
    const { incompleteDatabaseURL } = this.state;
    if (!incompleteDatabaseURL) { return; }
    this.setState({
      databaseURL: incompleteDatabaseURL,
      isEditingDatabaseURL: false,
    });
  }
  
  typeVascoDatabaseURL(e) {
    this.setState({
      incompleteDatabaseURL: e.target.value,
      isEditingDatabaseURL: true,
    });
  }
  
  isServiceDead(serviceId) {
    const { services } = this.state;
    return !services[serviceId] || !Object.keys(services[serviceId]).length;
  }
  
  selectService(serviceId) {
    if (this.isServiceDead(serviceId)) { return; }
    this.setState({
      selectedService: serviceId,
    });
  }
  
  render() {
    const {
      databaseURL,
      incompleteDatabaseURL,
      isEditingDatabaseURL,
      services,
      selectedService,
    } = this.state;
    return (
      <div className="App">
        <header className="App-header">
          <h1 className="App-title">
            Vasco Services Dashboard
          </h1>
          <div className="App-config">
            { !isEditingDatabaseURL &&
              <a
                className="App-config-permalink"
                href={ "/?vasco_url=" + databaseURL }
              >
                <span
                  className="App-config-permalink-icon"
                  role="img"
                  aria-label="Permanent link"
                  alt="Permanent link"
                >
                  🔗
                </span>
              </a>
            }
            { !isEditingDatabaseURL ?
              <span
                className="App-config-db-url-view"
                onClick={ this.editDatabaseURL }
              >
                { databaseURL }
              </span> :
              <input
                className="App-config-db-url-input"
                placeholder="Enter Vasco Database URL (VASCO_URL)"
                autoFocus
                value={ incompleteDatabaseURL }
                onBlur={ this.setVascoDatabaseURL }
                onChange={ this.typeVascoDatabaseURL }
              />
            }
          </div>
        </header>
        
        { databaseURL &&
          <section className="App-services">
            <h2 className="App-services-header">
              Services
            </h2>
            <div className="App-services-data">
              <table className="App-services-list">
                <thead>
                  <tr>
                    <th className="App-services-list-header-status">
                      Status
                    </th>
                    <th className="App-services-list-header-name">
                      Name & Version
                    </th>
                    <th className="App-services-list-header-num-instances">
                      # Instances
                    </th>
                    <th className="App-services-list-header-selection-indicator">
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {
                    Object.keys(services).map(serviceId =>
                      <tr
                        key={ serviceId }
                        className={
                          selectedService === serviceId ?
                            "App-services-list-selected" :
                            ""
                        }
                        style={{
                          cursor: this.isServiceDead(serviceId) ?
                            "default" :
                            "pointer"
                        }}
                        onClick={ () => this.selectService(serviceId) }
                      >
                        <td>
                          <div className="App-services-list-status">
                            <div
                              className="App-services-list-status-icon"
                              style={{
                                backgroundColor: this.isServiceDead(serviceId) ?
                                  '#ff5d55' :
                                  '#72bb53'
                              }}
                            >
                            </div>
                          </div>
                        </td>
                        <td className="App-services-list-name">
                          { serviceId }
                        </td>
                        <td className="App-services-list-num-instances">
                          { Object.keys(services[serviceId]).length || "-"}
                        </td>
                        <td className={
                          selectedService === serviceId ?
                            "App-services-list-selection-indicator-on" :
                            "App-services-list-selection-indicator-off"
                        }>
                        </td>
                      </tr>
                    )
                  }
                </tbody>
              </table>
              { selectedService && !this.isServiceDead(selectedService) &&
                <table className="App-service-instances">
                  <thead>
                    <tr>
                      <th>Instances</th>
                    </tr>
                  </thead>
                  <tbody>
                    {
                      Object.keys(services[selectedService]).map(url =>
                        <tr key={url}>
                          <td>{ url }</td>
                        </tr>
                      )
                    }
                  </tbody>
                </table>
              }
            </div>
          </section>
        }
      </div>
    );
  }
}

export default autobind(App);
