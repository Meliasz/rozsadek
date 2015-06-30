/**
 * Created by Meliasz on 2015-06-10.
 */
var mongoose = require('mongoose');

var TekstSchema = new mongoose.Schema({
    contents: String,
    category: String,
    title:String,
    //link:String,
    date: {type: Date, isoDateTime: Date.now()},
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
    author:String
});

mongoose.model('Tekst', TekstSchema);