const EboxesModel = require('../models/eboxes.model');
const crypto = require('crypto');

exports.insert = (req, res) => {
    EboxesModel.createEbox(req.body)
        .then((result) => {
            res.status(201).send(result);
        });
};

exports.list = (req, res) => {
    let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    let page = 0;
    if (req.query) {
        if (req.query.page) {
            req.query.page = parseInt(req.query.page);
            page = Number.isInteger(req.query.page) ? req.query.page : 0;
        }
    }
    EboxesModel.list(limit, page)
        .then((result) => {
            res.status(200).send(result);
        })
};

exports.getByImei = (req, res) => {
    EboxesModel.findByImei(req.params.imei)
        .then((result) => {
            res.status(200).send(result);
        });
};
exports.patchByImei = (req, res) => {
    EboxesModel.patchEbox(req.params.imei, req.body)
        .then((result) => {
            res.status(204).send({});
        });

};

exports.removeByImei = (req, res) => {
    EboxesModel.removeByImei(req.params.imei)
        .then((result)=>{
            res.status(204).send({});
        });
};
