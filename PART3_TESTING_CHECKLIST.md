# Part 3 - Testing Checklist

## Environment Setup
- [ ] Verify `EXPO_PUBLIC_GEMINI_API_KEY` is set in `.env`
- [ ] Verify Gemini API is enabled in Google Cloud Console
- [ ] Verify internet connection for WebSocket

## Feature Testing

### Screen Loading
- [ ] Part 3 screen loads without errors
- [ ] Random topic is displayed correctly
- [ ] Main question and sub-questions are visible
- [ ] Instructions are clear

### Discussion Flow
- [ ] "Start Discussion" button connects to Gemini
- [ ] Initial greeting from Gemini appears
- [ ] Audio recorder appears after connection
- [ ] Conversation log displays messages

### Audio Recording
- [ ] Microphone permission is requested
- [ ] Recording starts when button tapped
- [ ] Recording stops when button released
- [ ] Audio is sent to Gemini after recording
- [ ] "Recording sent..." message appears
- [ ] No errors during audio processing

### Gemini Responses
- [ ] Gemini receives audio and responds
- [ ] Text responses appear in conversation
- [ ] Multiple exchanges work correctly
- [ ] Topics vary when restarting

### Session Ending
- [ ] "End Discussion" button closes connection
- [ ] App navigates back to speaking index
- [ ] No errors on exit
- [ ] Can start new session immediately

## Error Handling
- [ ] Missing API key shows error
- [ ] Network error is handled gracefully
- [ ] Recording permission denial is handled
- [ ] WebSocket disconnection is handled

## UI/UX
- [ ] Messages are properly styled
- [ ] User messages are on right side
- [ ] AI messages are on left side
- [ ] Conversation scrolls to show all messages
- [ ] Loading spinner appears during processing
- [ ] "Recording sent..." placeholder works

## Code Quality
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No broken imports
- [ ] All types are correct

## Notes for Testing

1. **First Time Testing**
   - Ensure Gemini Live API is reachable
   - Check WebSocket connection in browser console
   - Monitor network tab for WebSocket messages

2. **Audio Testing**
   - Speak clearly for better recognition
   - Test with short and long recordings
   - Verify audio is base64 encoded correctly

3. **Multiple Conversations**
   - Test ending and restarting multiple times
   - Verify memory is cleaned up
   - Confirm connection closes properly

## Debugging Tips

If Gemini doesn't respond:
1. Check API key is correct
2. Verify API is enabled in Google Cloud
3. Check WebSocket URL format in code
4. Monitor console for error messages
5. Check network tab for failed connections

If audio doesn't work:
1. Check microphone permissions
2. Verify audio format (base64, PCM 16-bit)
3. Check file system access
4. Monitor audio conversion function

If UI doesn't update:
1. Check React state updates
2. Verify callback functions are set
3. Check message array is updating
4. Verify ScrollView is rendering children
