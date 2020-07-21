const mongoose = require('../../common/services/mongoose.service').mongoose;
const Schema = mongoose.Schema;

const eboxSchema = new Schema({
    imei: String,
    lat: Number,
    lng: Number,
    command: Number,
    pending: Number,
    timestamp: Date,
    balance: Number
});

eboxSchema.findByImei = function (imei) {
    return this.model('Eboxes').find({imei: this.imei}, imei);
};

const Ebox = mongoose.model('Eboxes', eboxSchema);


exports.findByLatlng = (coord) => {
    return Ebox.find({lat: coord.lat, lng: coord.lng});
};

exports.findByImei = (imei) => {
    return Ebox.find({imei: imei})
        .then((result) => {
            // console.log(result);
            if (result)
                return result[0];
            else
                return null;
        })
        .catch((err) => {
            console.log(err);
            return null;
        });
};

exports.createEbox = (eboxData) => {
    const ebox = new Ebox({
        ...eboxData,
        // Command field is called command on the front end for code readability, however it has ot be reassigned to pending as it must first be issued to the ebox
        pending: eboxData.command,
        command: 1,
        balance: 15000,
        timestamp: new Date()
    });
    return ebox.save();
};

exports.list = (perPage, page) => {
    return new Promise((resolve, reject) => {
        Ebox.find()
            .exec(function (err, eboxes) {
                if (err) {
                    reject(err);
                } else {
                    resolve(eboxes);
                }
            })
    });
};

exports.patchEbox = (imei, eboxData) => {
    return new Promise((resolve, reject) => {
        Ebox.find({imei: imei})
            .then(ebox => {
                if (Array.isArray(ebox) && ebox.length === 1) {
                    let newEbox = {
                        ...ebox[0],
                        ...eboxData
                    };
                    for (let i in newEbox) {
                        ebox[0][i] = newEbox[i];
                    }
                    ebox[0].save(function (err, updatedEbox) {
                        if (err) return reject(err);
                        resolve(updatedEbox);
                    });
                } else {
                    reject("Multiple documents with the IMEI number: " + imei);
                }
            })
            .catch(err => {
                // console.log(err);
                reject(err);
            });
    })

};

exports.removeByImei = (imei) => {
    return new Promise((resolve, reject) => {
        Ebox.deleteMany({imei: imei}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

