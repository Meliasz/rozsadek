/**
 * Created by Meliasz on 2015-06-21.
 */
var mongoose = require('mongoose');

var CommentSchema = new mongoose.Schema({
    body: String,
    date: {type: Date, default: new Date(Date.UTC(Date.now()))},
    tekst: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Tekst' }],
    author:String
});

mongoose.model('Comment', CommentSchema);