import mongoose from "mongoose";

const sessionSchema = mongoose.Schema({
    sessionId: {
        type: String,
        required: true,
        trim: true,
    },
    previous_Orders: {
        type: Array,
        //required: true,
        default: [],
        trim: true,
    },
    date_order_was_placed:{
       type:Array,
       default:[],
       trim: true 
    },
}, {
    timestamps: true
})

sessionSchema.set("toJSON", {
    virtuals: true, 
    versionKey: false, 
    transform: function(doc, ret){
        delete ret._id
    }
})

const sessionDatabase = mongoose.model("User", sessionSchema)
export default sessionDatabase