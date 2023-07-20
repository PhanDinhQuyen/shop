const mongoose = require("mongoose");

const connectString = process.env.URL_MONGO;

class Database {
  constructor() {
    this.connect();
  }

  connect() {
    if (process.env.NODE_ENV === "local") {
      mongoose.set("debug", true);
      mongoose.set("debug", {
        color: "true",
      });
    }
    mongoose
      .connect(connectString, {
        maxPoolSize: 50,
      })
      .then(() => console.log(`Connected to ${connectString} successfully`))
      .catch((error) => console.error(error));
  }

  static getInstance() {
    if (!this.instance) {
      this.instance = new Database();
    }
    return this.instance;
  }
}

const instance = Database.getInstance();

module.exports = instance;
