const MeetingHistory = require('../../model/schema/meeting')
const mongoose = require('mongoose');
const User = require('../../model/schema/user');

const add = async (req, res) => {
    try {
       const result = new MeetingHistory(req.body);
        await result.save();
        res.status(200).json(result);
    } catch (err) {
        console.error('Failed to create :', err);
        res.status(400).json({ err, error: 'Failed to create' });
    } 
}

const index = async (req, res) => {
    try {
        const query = { ...req.query, deleted: false };
        const user = await User.findById(req.user.userId);
        
        if (user?.role !== "superAdmin") {
            delete query.createBy;
            query.$or = [{ createBy: new mongoose.Types.ObjectId(req.user.userId) }];
        }

        let result = await MeetingHistory.aggregate([
            { $match: query },
            {
                $lookup: {
                    from: "Contacts",
                    localField: "attendes",
                    foreignField: "_id",
                    as: "attendeesData",
                },
            },
            {
                $lookup: {
                    from: "Leads",
                    localField: "attendesLead",
                    foreignField: "_id",
                    as: "attendeesLeadData",
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "createBy",
                    foreignField: "_id",
                    as: "users",
                },
            },
            { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
            { $match: { "users.deleted": false } },
            {
                $addFields: {
                    createdByName: { $concat: ['$users.firstName', ' ', '$users.lastName'] },
                    attendeesNames: {
                        $map: {
                            input: "$attendeesData",
                            as: "attendee",
                            in: { $concat: ['$$attendee.firstName', ' ', '$$attendee.lastName'] }
                        }
                    },
                    attendeesLeadNames: {
                        $map: {
                            input: "$attendeesLeadData",
                            as: "lead",
                            in: { $concat: ['$$lead.firstName', ' ', '$$lead.lastName'] }
                        }
                    }
                }
            },
            { $project: { users: 0, attendeesData: 0, attendeesLeadData: 0 } },
        ]);
        
        res.status(200).json(result);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

const view = async (req, res) => {
    try {
        let response = await MeetingHistory.findOne({ _id: req.params.id });
        if (!response) return res.status(404).json({ message: "No meeting found." });
        
        let result = await MeetingHistory.aggregate([
            { $match: { _id: response._id } },
            {
                $lookup: {
                    from: "Contacts",
                    localField: "attendes",
                    foreignField: "_id",
                    as: "attendeesData",
                },
            },
            {
                $lookup: {
                    from: "Leads",
                    localField: "attendesLead",
                    foreignField: "_id",
                    as: "attendeesLeadData",
                },
            },
            {
                $lookup: {
                    from: "User",
                    localField: "createBy",
                    foreignField: "_id",
                    as: "users",
                },
            },
            { $unwind: { path: "$users", preserveNullAndEmptyArrays: true } },
            { $match: { "users.deleted": false } },
            {
                $addFields: {
                    createdByName: { $concat: ['$users.firstName', ' ', '$users.lastName'] },
                    attendeesDetails: {
                        $map: {
                            input: "$attendeesData",
                            as: "attendee",
                            in: {
                                _id: "$$attendee._id",
                                name: { $concat: ['$$attendee.firstName', ' ', '$$attendee.lastName'] },
                                email: "$$attendee.email",
                                phone: "$$attendee.phone"
                            }
                        }
                    },
                    attendeesLeadDetails: {
                        $map: {
                            input: "$attendeesLeadData",
                            as: "lead",
                            in: {
                                _id: "$$lead._id",
                                name: { $concat: ['$$lead.firstName', ' ', '$$lead.lastName'] },
                                email: "$$lead.email",
                                phone: "$$lead.phone"
                            }
                        }
                    }
                }
            },
            { $project: { users: 0 } },
        ]);
        
        res.status(200).json(result[0]);
    } catch (err) {
        console.error("Error:", err);
        res.status(400).json({ error: err });
    }
};

const deleteData = async (req, res) => {
    try {
        const result = await MeetingHistory.findByIdAndUpdate(req.params.id, {
            deleted: true,
        });
        res.status(200).json({ message: "done", result });
    } catch (err) {
        console.error("Error:", err);
        res.status(404).json({ message: "error", err });
    }
};

const deleteMany = async (req, res) => {
    try {
        const result = await MeetingHistory.updateMany(
            { _id: { $in: req.body } },
            { $set: { deleted: true } }
        );

        if (result?.matchedCount > 0 && result?.modifiedCount > 0) {
            return res
                .status(200)
                .json({ message: "Meetings removed successfully", result });
        } else {
            return res
                .status(404)
                .json({ success: false, message: "Failed to remove meetings" });
        }
    } catch (err) {
        return res.status(404).json({ success: false, message: "error", err });
    }
};

module.exports = { add, index, view, deleteData, deleteMany }