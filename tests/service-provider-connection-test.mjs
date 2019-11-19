import test from "ava";
import {
  TestService,
  TestServiceWithoutAdditionalEndpoints,
  makeServices
} from "./util.mjs";

test("declare services", async t => {
  const sp = await makeServices();

  const [s2, s3, s4] = await sp.declareServices(
    {
      s2: {
        type: TestService,
        endpoints: {
          testOut: { connected: "service(s3).testIn" }
        }
      },
      s3: {
        type: TestService,
        key3: 2,
        endpoints: {
          testIn: { receive: "testReceive" }
        }
      },
      s4: {
        type: TestServiceWithoutAdditionalEndpoints
      }
    },
    true
  );

  t.is(s3.name, "s3");
  t.is(s3.type, "test");
  t.is(s3.key3, 2);
  t.is(s4.name, "s4");
  t.is(s4.type, "test-without-additional-endpoints");

  t.true(s2.endpoints.testOut.isConnected);
  t.is(s2.endpoints.testOut.otherEnd.name, 'testIn');

  //t.true(s3.endpoints.testIn.isConnected);

  /*
  console.log(s3.endpoints.testIn);
*/
});
