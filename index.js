const express = require('express');
const { middleware, errorMiddleware } = require('@envoy/envoy-integrations-sdk');

const app = express();
app.use(middleware());


app.post('/visit-duration', (req, res) => {
  res.send([
    {
      label: 'MaxVisitDuration',
      value: 180,
    },
  ]);
});


let maxVisitDurationLocal = Infinity;

app.post('/validate-me', (req, res) => {
  const envoy = req.envoy
  const maxVisitDuration = envoy.payload.MaxVisitDuration

  if (maxVisitDuration >= 0 && maxVisitDuration <= 180) {
    maxVisitDurationLocal = maxVisitDuration;

    res.send({ message: 'Success!'});
  } else {
    res.sendFailed('These values are bad: the duration should be between 0 and 180 minutes');
  }
});


app.post('/visitor-sign-in', async (req, res) => {
  const envoy = req.envoy;
  const job = envoy.job;

  await job.attach({ label: 'Event', value: 'Visitor signed in successfully' });
  res.send({ message: 'Success!'});
});


app.post('/visitor-sign-out', (req, res) => {
  const envoy = req.envoy
  const attributes = envoy.payload.attributes
  const signInTime = attributes['signed-in-at']
  const signOutTime = attributes['signed-out-at']

  const signIn = new Date(signInTime);
  const signOut = new Date(signOutTime);
  const maxDurationInMillseconds = maxVisitDurationLocal * 60 * 1000;
  const differenceInMilliseconds = signOut - signIn;

  if (maxDurationInMillseconds < differenceInMilliseconds) {
    res.sendFailed('The visitor overstayed their alloted time.');
  } else {
    res.send({message: 'The visitor did not overstay their alloted time.'});
  }
});


app.use(errorMiddleware());

const listener = app.listen(process.env.PORT || 0, () => {
  console.log(`Listening on port ${listener.address().port}`);
});
