const EboxesModel = require('../models/eboxes.model');
const UserModel = require('../../users/models/users.model');
const crypto = require('crypto');

exports.insert = (req, res) => {
    EboxesModel.findByImei(req.body.imei)
        .then((result) => {
            if (result) {
                res.status(400).send();
            } else {
                EboxesModel.createEbox(req.body)
                    .then((result) => {
                        // console.log(req.jwt);
                        // console.log(req.body);
                        UserModel.addEboxToUser(req.jwt.userId, req.body.imei)
                            .then(result => {
                                res.status(201).send(result);
                            });
                    });
            }
        });

};

exports.insertData = (req, res) => {
    EboxesModel.findByImei(req.body.imei)
        .then((result) => {
            if (result) {
                EboxesModel.addData(req.body)
                    .then(result => {
                        res.status(201).send();
                    })
                    .catch(err => {
                        res.status(200).send();
                    });
                    // If the ebox doesn't exist, that is fine
                    // The ebox has been used before activation on the database and user's account, so ditch it and let the ebox carry on.
            } else {
                res.status(200).send();
            }
        });

};

exports.list = (req, res) => {
    // let limit = req.query.limit && req.query.limit <= 100 ? parseInt(req.query.limit) : 10;
    // let page = 0;
    // if (req.query) {
    //     if (req.query.page) {
    //         req.query.page = parseInt(req.query.page);
    //         page = Number.isInteger(req.query.page) ? req.query.page : 0;
    //     }
    // }
    // console.log(req.jwt);
    let eboxRequests = [];
    try {
        UserModel.findById(req.jwt.userId)
            .then((user) => {
                if (user.devices) {
                    user.devices.forEach(d => {
                        // console.log(d);
                        eboxRequests.push(EboxesModel.findByImei(d));
                    });
                    Promise.all(eboxRequests)
                        .then(eboxes => {
                            // console.log("WORKED");
                            // console.log(eboxes);
                            // setTimeout(() => {
                            res.status(200).send(eboxes)
                            // }, 3000);
                        })
                } else {
                    // setTimeout(() => {
                    res.status(200).send([]);
                    // }, 3000);
                }
            })
            .catch((err) => {
                // console.log(err);
                res.status(500).send(err);
            });
        // console.log(req.jwt);
    } catch (e) {
        // console.log(e);
        res.status(500).send(e);
    }
    // EboxesModel.list()
    //     .then((result) => {
    //         // res.header('Access-Control-Expose-Headers', 'X-Total-Count');
    //         // res.set('X-Total-Count', 10);
    //         res.status(200).send(result);
    //     })
};

exports.getByImei = (req, res) => {
    EboxesModel.findByImei(req.params.imei)
        .then((result) => {
            res.status(200).send(result);
        });
};

exports.getCommandByImei = (req, res) => {
    EboxesModel.getCommandByImei(req.params.imei)
        .then((result) => {
            res.status(200).send(result.toString());
        })
        .catch((err) =>{
            console.log(err);
            res.status(200).send(1);
        })
};

exports.patchByImei = (req, res) => {
    EboxesModel.patchEbox(req.params.imei, req.body)
        .then(() => {
            res.status(204).send();
        })
        .catch((err) => {
            res.status(500).send(err);
        })
};

exports.removeManyByImei = (req, res) => {
    let completed = [];
    req.body.eboxes.forEach(e => {
        // console.log('removing: ', e);
        completed.push(EboxesModel.removeByImei(e));
        // console.log(req.jwt.userId);
    });
    completed.push(UserModel.removeEboxesFromUser(req.jwt, req.body.eboxes));
    // TODO Remove device data too when data is implemented
    Promise.all(completed)
        .then(() => {
            console.log('removed all');
            res.status(200).send();
        })
        .catch(errors => {
            console.log(errors);
            res.status(500).send({errors});
        });
};

exports.removeByImei = (req, res) => {
    EboxesModel.removeByImei(req.params.imei)
        .then(() => {
            res.status(204).send({});
        });
};
