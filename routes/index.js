/**
 * @module routes
 * @author Devon Rojas
 * 
 * @requires routes/admin
 * @requires routes/search
 */
const AdminRouter = require("./admin.router");
const SearchRouter = require("./search.router");

module.exports = {
    AdminRouter, SearchRouter
}