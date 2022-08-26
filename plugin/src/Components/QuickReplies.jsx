import React, { useState, useEffect, useRef } from 'react';
import { withTaskContext, Button } from '@twilio/flex-ui';
import { Input, Label, Box } from '@twilio-paste/core';
import { PlusIcon } from '@twilio-paste/icons/esm/PlusIcon';

import { Actions } from '@twilio/flex-ui';

const QuickReplies = ({ task }) => {
  const defaultState = {
    expand: false,
    inputs: [''],
  };

  const [expand, setExpand] = useState(defaultState.expand);
  const [inputs, setInputs] = useState(defaultState.inputs);

  const ref = useRef(defaultState.inputs);

  useEffect(() => {
    ref.current = inputs;
  }, [inputs]);

  useEffect(() => {
    Actions.replaceAction('SendMessage', (payload, original) => {
      const updatedPayload = {
        ...payload,
        messageAttributes: ref.current,
      };
      original(updatedPayload);
      setInputs(defaultState.inputs);
    });
  }, []);

  return (
    <>
      {task.attributes.customChannel === 'Twitter' ? (
        <div>
          <Button
            variant={expand ? 'destructive' : 'primary'}
            pressed={expand}
            onClick={() => {
              setExpand(!expand);
              setInputs(defaultState.inputs);
            }}
          >
            {expand
              ? 'Remove Quick Reply Options'
              : '✨ Add Quick Reply Options'}
          </Button>
          {expand ? (
            <>
              {inputs.map((input, idx) => (
                <Input
                  id="themeName"
                  type="text"
                  placeholder={`Reply ${idx + 1}`}
                  value={input}
                  onChange={(e) => {
                    setInputs(
                      inputs.map((curInput, curIdx) => {
                        if (idx === curIdx) {
                          return e.target.value;
                        }
                        return curInput;
                      })
                    );
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && inputs.length < 4) {
                      setInputs([...inputs, '']);
                    }
                  }}
                ></Input>
              ))}
            </>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

export default withTaskContext(QuickReplies);
