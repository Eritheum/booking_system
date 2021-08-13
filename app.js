const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const mongoose = require("mongoose");
const apiSchema = require("./api/schema/index");
const aipResolvers = require("./api/resolvers/index");

const isAuth = require("./middleware/is-auth");

const app = express();

app.use(express.json());

app.use(isAuth);

app.use(
  "/api",
  graphqlHTTP({
    schema: apiSchema,
    rootValue: aipResolvers,
    graphiql: true,
  })
);

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.xuv3i.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`
  )
  .then(() => {
    app.listen(8000);
    console.log("Server is running on Port: 8000");
  })
  .catch((err) => {
    console.log(err);
  });
