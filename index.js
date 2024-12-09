const express = require('express');
const { middleware, errorMiddleware } = require('@envoy/envoy-integrations-sdk');

const app = express();
app.use(middleware());

let maxVisitDurationLocal = Infinity;

app.post('/visit-duration', (req, res) => {
  res.send([
    {
      label: 'MaxVisitDuration',
      value: 180,
    },
  ]);
});

app.post('/validate-me', (req, res) => {
// app.post('/validate-me', async (req, res) => {
  const envoy = req.envoy
  // const installStorage = envoy.installStorage
  const maxVisitDuration = envoy.payload.MaxVisitDuration

  if (maxVisitDuration >= 0 && maxVisitDuration <= 180) {
    // await installStorage.set('maxVisitDuration', maxVisitDuration);
    // const { value } = await installStorage.get('maxVisitDuration');
    // console.log('maxVisitDuration value:', value)
    console.log('here!')
    maxVisitDurationLocal = maxVisitDuration;
    console.log('maxVisitDurationLocal: ', maxVisitDurationLocal)
    // const job = envoy.job;
    // await job.attach({ label: 'maxVisitDuration', value: maxVisitDuration }); // show in the Envoy dashboard.

    res.send({ message: 'Success!', message: 'test'});
    // res.send({ maxVisitDuration: maxVisitDuration, message: 'Success!'});
  } else {
    res.sendFailed('These values are bad: the duration should be between 0 and 180 minutes');
  }
});

app.post('/visitor-sign-in', async (req, res) => {
  const envoy = req.envoy;
  const job = envoy.job;

  await job.attach({ label: 'Event', value: 'Visitor signed in successfully' });
  res.send();
});


app.post('/visitor-sign-out', async (req, res) => {
  // const envoy = req.envoy; // our middleware adds an "envoy" object to req.
  // const job = envoy.job;
  // const goodbye = envoy.meta.config.GOODBYE;
  // const visitor = envoy.payload;
  // const visitorName = visitor.attributes['full-name'];
  const envoy = req.envoy
  const installStorage = envoy.installStorage
  // console.log('envoy:', envoy)
  // console.log('envoy body:', envoy.body)
  // console.log('envoy > body > payload:', envoy.body.payload)
  // console.log('envoy > body > payload > attribs:', envoy.body.payload.attributes)
  // console.log('envoy > body > meta >:', envoy.body.meta)
  // console.log('envoy > body > meta > config:', envoy.body.meta.config)
  // console.log('envoy > body > env > config:', envoy.body.env.config)
  // const maxVisitDuration = envoy.payload.MaxVisitDuration
  // console.log('maxVisitDuration:', maxVisitDuration)
  const attributes = envoy.payload.attributes
  const signInTime = attributes['signed-in-at']
  const signOutTime = attributes['signed-out-at']
  console.log('signInTime:', signInTime)
  console.log('signOutTime:', signOutTime)
  
  // const { maxVisitDuration } = await installStorage.get('maxVisitDuration');
  // console.log('maxVisitDuration sig out:', maxVisitDuration)
  console.log('maxVisitDurationLocal sig out:', maxVisitDurationLocal)
  
  const signIn = new Date(signInTime);
  console.log('signIn:', signIn)
  const signOut = new Date(signOutTime);
  console.log('signOut:', signOut)
  const maxDurationInMillseconds = maxVisitDurationLocal * 60 * 1000;
  console.log('maxDurationInMillseconds:', maxDurationInMillseconds)
  const differenceInMilliseconds = signOut - signIn;
  console.log('differenceInMilliseconds:', differenceInMilliseconds)

  if (maxDurationInMillseconds < differenceInMilliseconds) {
    res.sendFailed('The visitor overstayed their alloted time.');
  } else {
    res.send({message: 'The visitor did not overstay their alloted time.'});
  }
});


app.use(function (req, res, next) {
  console.log('Time:', Date.now())
  console.log('======')
  next()
})

app.use(errorMiddleware());

const listener = app.listen(process.env.PORT || 0, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
