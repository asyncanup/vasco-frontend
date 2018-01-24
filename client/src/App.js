/*global EventSource */
import React, { Component } from "react";
import autobind from "autobind-decorator";

import "reset-css";
import "./App.css";

const endpointExpirations = {};

class App extends Component {
  state = {
    databaseURL: "asd",
    incompleteDatabaseURL: "",
    isEditingDatabaseURL: false,
    services: {},
    selectedService: "",
  }
  
  componentDidMount() {
    const serverEvents = new EventSource('data');
    serverEvents.addEventListener('message', e => console.log(e));
    serverEvents.addEventListener('set', e => {
      // eslint-disable-next-line
      const [ aliveKey, serviceId, EX, expiry ] = JSON.parse(e.data);
      if (!aliveKey.startsWith('alive.')) { return; }

      const { services } = this.state;
      const endpoint = aliveKey.split('alive.')[1];
      const serviceEndpoints = services[serviceId] || [];
      if (serviceEndpoints.indexOf(endpoint) === -1) {
        this.setState({
          services: {
            ...services,
            [serviceId]: serviceEndpoints.concat(endpoint)
          }
        });
      }
      if (endpointExpirations[endpoint]) {
        clearTimeout(endpointExpirations[endpoint]);
      }
      endpointExpirations[endpoint] = setTimeout(() => {
        const { services } = this.state;
        this.setState({
          services: {
            ...services,
            [serviceId]: services[serviceId].filter(url => url !== endpoint)
          }
        });
      }, (+expiry + 1) * 1000);
    }, false);
    
    serverEvents.addEventListener('open', function(e) {
      console.log('connected');
    }, false)
  
    serverEvents.addEventListener('error', function(e) {
      if (e.readyState === EventSource.CLOSED) {
        console.error('disconnected');
      }
    }, false)
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
    return !services[serviceId] || !services[serviceId].length;
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
            {
              (Object.keys(services).length || null) &&
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
                            { services[serviceId].length || "-"}
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
                        services[selectedService].map(url =>
                          <tr key={url}>
                            <td>{ url }</td>
                          </tr>
                        )
                      }
                    </tbody>
                  </table>
                }
              </div>
            }
          </section>
        }
      </div>
    );
  }
}

export default autobind(App);
