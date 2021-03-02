"use strict";

const { ZwaveDevice } = require("homey-zwavedriver");

// http://www.pepper1.net/zwavedb/device/430

class ZG8101 extends ZwaveDevice {
  // this method is called when the Device is inited
  async onNodeInit({ node }) {
    // enable debugging
    this.enableDebug();

    // print the node's info to the console
    this.printNode();

    this.registerCapability("alarm_contact", "COMMAND_CLASS_BASIC", {
      report: "BASIC_SET",
      reportParser: report => report["Value"] === 255,
    });

    this.registerCapability("alarm_generic", "COMMAND_CLASS_SENSOR_BINARY", {
      get: "SENSOR_BINARY_GET",
      report: "SENSOR_BINARY_REPORT",
      reportParser: report => report["Sensor Value"] === "detected an event",
    });

    this.registerCapability("measure_battery", "COMMAND_CLASS_BATTERY", {
      get: "BATTERY_GET",
      report: "BATTERY_REPORT",
      reportParser: report =>
        report["Battery Level"] === "battery low warning"
          ? 1
          : report["Battery Level (Raw)"][0],
    });

    this.registerReportListener(
      "COMMAND_CLASS_BASIC",
      "BASIC_SET",
      (command, report) => {
        if (command.name === "BASIC_SET") {
          let newValue = false;
          if (report.Value === 255) {
            newValue = true;
          }

          module.exports.realtime(node.device_data, "alarm_contact", newValue);
        }
      }
    );
  }
}

module.exports = ZG8101;
