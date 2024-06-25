const utilities = require('./utilities');

describe('Validate Username, Email, and Password properties', () => {
  const validUsername = 'user0';
  const validEmail = 'user0@user.com';
  const validPassword = 'UserUser!0';
  const invalidUsername = 'user0!!!';
  const invalidEmail = 'user.com';
  const invalidPassword = 'aaaaaaaa';
  const vldUsEmPw = { username: validUsername, email: validEmail, password: validPassword };
  const invldUsEmPw = { username: invalidUsername, email: invalidEmail, password: invalidPassword };
  const emptyObject = {};
  test('Valid Username, Email, and Password properties', () => {
    const userRecord = utilities.validateUsernameEmailPassword(vldUsEmPw);
    expect(userRecord)
      .toMatchObject({ usernameRegexPass: true, emailRegexPass: true, passwordRegexPass: true });
  });
  test('Invalid Username, Email, and Password properties', () => {
    const userRecord = utilities.validateUsernameEmailPassword(invldUsEmPw);
    expect(userRecord)
      .toMatchObject({ usernameRegexPass: false, emailRegexPass: false, passwordRegexPass: false });
  });
  test('Does not validate properties that dont exist in object', () => {
    const userRecord = utilities.validateUsernameEmailPassword(emptyObject);
    expect(userRecord).toStrictEqual(emptyObject);
  });
});

describe('Validate URL and Image URL', () => {
  const imageURL = 'https://example.com/image.jpg';
  const videoURL = 'https://example.com/video.mp4';
  test('Valid Image URL', () => {
    const urlValid = utilities.isValidImageUrl(imageURL);
    expect(urlValid).toBe(true);
  });
  test('Valid Video URL', () => {
    const urlValid = utilities.isValidVideoUrl(videoURL);
    expect(urlValid).toBe(true);
  });
  test('Invalid Image URL', () => {
    const urlValid = utilities.isValidImageUrl(videoURL);
    expect(urlValid).toBe(false);
  });
  test('Invalid Video URL', () => {
    const urlValid = utilities.isValidVideoUrl(imageURL);
    expect(urlValid).toBe(false);
  });
});
