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
    return Ebox.find({_id: imei})
        .then((result) => {
            return result;
        })
        .catch((err) => {
            console.log(err);
            return null;
        });
};

exports.createEbox = (eboxData) => {
    const ebox = new Ebox({...eboxData, timestamp: new Date()});
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
                    for (let i in eboxData) {
                        ebox[0][i] = eboxData[i];
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
                console.log(err);
                reject(err);
            });
    })

};

exports.removeByImei = (userImei) => {
    return new Promise((resolve, reject) => {
        Ebox.remove({imei: userImei}, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(err);
            }
        });
    });
};

