import React, { useState, useEffect, useRef } from 'react';
import { withTaskContext } from '@twilio/flex-ui';
import { Flex, Button, Input, Box, Text } from '@twilio-paste/core';
import { DeleteIcon } from '@twilio-paste/icons/esm/DeleteIcon';

import { Theme } from '@twilio-paste/core/theme';

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
    if (inputs.length < 1) {
      setExpand(false);
    }
  }, [inputs]);

  useEffect(() => {
    Actions.replaceAction('SendMessage', (payload, original) => {
      const updatedPayload = {
        ...payload,
        messageAttributes: ref.current,
      };
      original(updatedPayload);
      setInputs(defaultState.inputs);
      setExpand(defaultState.expand);
    });
  }, []);

  return (
    <Theme.Provider theme="default">
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
                <Flex>
                  <Box paddingTop="space40" width="100%">
                    <Input
                      id="quick-reply-theme"
                      type="text"
                      autoFocus
                      placeholder={`Type quick reply option ${idx + 1} here...`}
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
                  </Box>
                  <Box paddingTop="space40" paddingLeft="space30">
                    <Button
                      variant="destructive_secondary"
                      onClick={() => {
                        setInputs(
                          inputs.filter((curInput, curIdx) => idx !== curIdx)
                        );
                      }}
                    >
                      <DeleteIcon decorative={false} title="Delete icon" />
                    </Button>
                  </Box>
                </Flex>
              ))}
            </>
          ) : (
            <></>
          )}
        </div>
      ) : (
        <></>
      )}
    </Theme.Provider>
  );
};

export default withTaskContext(QuickReplies);
