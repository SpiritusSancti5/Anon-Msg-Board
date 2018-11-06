'use strict';

var expect = require('chai').expect;
var mongo = require('mongodb').MongoClient;
var ObjId = require('mongodb').ObjectID;
var url = process.env.DB;


module.exports = (app, db) => {
  
  app.route('/api/threads/:board')
    .get((req, res) =>
      db.collection(req.params.board).find(
        {},
        { reported: 0,
          delete_password: 0,
          "replies.delete_password": 0,
          "replies.reported": 0
        })
      .sort({bumped_on: -1})
      .limit(10)
      .toArray((err,docs)=>{
        docs.forEach(doc=> doc.replies = (doc.replies.length > 3) ? doc.replies.slice(-3) : doc.replies);
        res.json(docs)}))
  
    .post((req, res) =>
      db.collection(req.params.board).insert({
        text: req.body.text,
        created_on: new Date(),
        bumped_on: new Date(),
        reported: false,
        delete_password: req.body.delete_password,
        replies: []}, () => res.redirect('/b/'+req.params.board+'/')))
  
    .put((req, res) => {
        db.collection(req.params.board).findAndModify(
          {_id: new ObjId(req.body.report_id)},
          [],
          {$set: {reported: true}},
          (err, doc) => {});
        res.send('reported')})
  
    .delete((req, res) =>
      db.collection(req.params.board).findAndModify(
        { _id: new ObjId(req.body.thread_id),
          delete_password: req.body.delete_password },
        [],
        {},
        {remove: true, new: false},
      (err, doc) => (!doc.value) ? res.send('incorrect password') : res.send('success')));
    
  app.route('/api/replies/:board')
    .get((req, res) =>
      db.collection(req.params.board).find({_id: new ObjId(req.query.thread_id)},
      { reported: 0,
        delete_password: 0,
        "replies.delete_password": 0,
        "replies.reported": 0
      }).toArray((err,doc)=> res.json(doc[0])))
  
    .post((req, res) => {
      db.collection(req.params.board).findAndModify(
        {_id: new ObjId(req.body.thread_id)},
        [],
        { $set: {bumped_on: new Date()},
          $push: { 
            replies: {
              _id: new ObjId(),
              text: req.body.text,
              created_on: new Date(),
              reported: false,
              delete_password: req.body.delete_password 
            }  
          }
        });
      res.redirect('/b/'+req.params.board+'/'+req.body.thread_id)})
  
    .put((req, res) =>{
      db.collection(req.params.board).findAndModify(
        { _id: new ObjId(req.body.thread_id),
          "replies._id": new ObjId(req.body.reply_id) },
        [],
        { $set: { "replies.$.reported": true } });
      res.send('reported');
    })
  
    .delete((req, res) =>
      db.collection(req.params.board).findAndModify(
        { _id: new ObjId(req.body.thread_id),
          replies: { $elemMatch: { _id: new ObjId(req.body.reply_id), 
                                   delete_password: req.body.delete_password } }},
        [],
        { $set: { "replies.$.text": "[deleted]" } },
        (err, doc) => (!doc.value) ? res.send('incorrect password') : res.send('success')))

};
