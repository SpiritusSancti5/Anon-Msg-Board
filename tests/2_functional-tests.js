/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       (if additional are added, keep them at the very end!)
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', ()=>{
  
  var testId;  // thread1
  var testId2; // thread2
  var testId3; // reply

  suite('API ROUTING FOR /api/threads/:board', function() {
    
    suite('POST', function() {
      
      test('create new threads', (done)=>{
        chai.request(server)
        .post('/api/threads/testu_boardo')
        .send({text:'text', delete_password:'123'})
        .end((err, res)=>assert.equal(res.status, 200));
        chai.request(server)
        .post('/api/threads/testu_boardo')
        .send({text:'text', delete_password:'123'})
        .end((err, res)=>{
          assert.equal(res.status, 200)
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      
      test('last 10 threads with latest 3 replies each', (done)=>{
        chai.request(server)
        .get('/api/threads/testu_boardo')
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.isArray(res.body);
          assert.isAtMost(res.body.length, 10);
          assert.property(res.body[0], '_id');
          assert.property(res.body[0], 'created_on');
          assert.property(res.body[0], 'bumped_on');
          assert.property(res.body[0], 'text');
          assert.property(res.body[0], 'replies');
          assert.notProperty(res.body[0], 'reported');
          assert.notProperty(res.body[0], 'delete_password');
          assert.isArray(res.body[0].replies);
          assert.isAtMost(res.body[0].replies.length, 3);
          testId = res.body[0]._id;
          testId2 = res.body[1]._id;
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('derete thread', (done)=>{
        chai.request(server)
        .delete('/api/threads/testu_boardo')
        .send({thread_id:testId, delete_password:'123'})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
      test('derete thread - wrong password', (done)=>{
        chai.request(server)
        .delete('/api/threads/testu_boardo')
        .send({thread_id: testId2, delete_password: 'wrong password'})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('report thread', (done)=>{
        chai.request(server)
        .put('/api/threads/testu_boardo')
        .send({report_id:testId2})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
      });
      
    });
    

  });
  
  suite('API ROUTING FOR /api/replies/:board', function() {
    
    suite('POST', function() {
      
      test('reply to thread', (done)=>{
        chai.request(server)
        .post('/api/replies/testu_boardo')
        .send({thread_id: testId2, text:'reply', delete_password:'123'})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          done();
        });
      });
      
    });
    
    suite('GET', function() {
      
      test('retrieve replies', (done)=>{
        chai.request(server)
        .get('/api/replies/testu_boardo')
        .query({thread_id: testId2})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.property(res.body, '_id');
          assert.property(res.body, 'created_on');
          assert.property(res.body, 'bumped_on');
          assert.property(res.body, 'text');
          assert.property(res.body, 'replies');
          assert.notProperty(res.body, 'delete_password');
          assert.notProperty(res.body, 'reported');
          assert.isArray(res.body.replies);
          assert.notProperty(res.body.replies[0], 'delete_password');
          assert.notProperty(res.body.replies[0], 'reported');
          assert.equal(res.body.replies[res.body.replies.length-1].text, 'reply');
          done();
        });
      });
      
    });
    
    suite('PUT', function() {
      
      test('report reply', (done)=>{
        chai.request(server)
        .put('/api/threads/testu_boardo')
        .send({thread_id:testId2 ,reply_id:testId2})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'reported');
          done();
        });
      });
      
    });
    
    suite('DELETE', function() {
      
      test('delete reply', (done)=>{
        chai.request(server)
        .delete('/api/threads/testu_boardo')
        .send({thread_id: testId2 ,reply_id: testId3, delete_password: '123'})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'success');
          done();
        });
      });
      
      test('delete reply - wrong password', (done)=>{
        chai.request(server)
        .delete('/api/threads/testu_boardo')
        .send({thread_id: testId2 ,reply_id: testId3, delete_password: 'wrong password'})
        .end((err, res)=>{
          assert.equal(res.status, 200);
          assert.equal(res.text, 'incorrect password');
          done();
        });
      });
      
    });
    
  });

});
