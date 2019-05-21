const express = require('express')

const routes = express.Router()

const HourController = require('./app/controllers/HourController')

routes.get('/', HourController.create)
routes.get('/sethour', HourController.create)
routes.post('/sethour', HourController.setHour)

module.exports = routes
