const usernameRegex = /^[A-Za-z0-9_]{1,15}$/;
const emailRegex = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
const usernameErrorMessage = 'Username must be 1 to 15 characters consisting only of letters, digits, and underscores.';
const emailErrorMessage = 'Email must be a valid email format.';
const passwordErrorMessage = 'Password must be at least 8 characters consisting of, and only of, at least one lowercase letter, one uppercase letter, one digit, and one special character (@,$,!,%,*,?,&).';

// used
function validateUsernameEmailPassword(object) {
  const returnObject = {};

  if (Object.hasOwn(object, 'username')) {
    const usernameRegexPass = usernameRegex.test(object.username);
    returnObject.usernameRegexPass = usernameRegexPass;
    if (!usernameRegexPass) {
      returnObject.usernameErrorMessage = usernameErrorMessage;
    }
  }

  if (Object.hasOwn(object, 'email')) {
    const emailRegexPass = emailRegex.test(object.email);
    returnObject.emailRegexPass = emailRegexPass;
    if (!emailRegexPass) {
      returnObject.emailErrorMessage = emailErrorMessage;
    }
  }

  if (Object.hasOwn(object, 'password')) {
    const passwordRegexPass = passwordRegex.test(object.password);
    returnObject.passwordRegexPass = passwordRegexPass;
    if (!passwordRegexPass) {
      returnObject.passwordErrorMessage = passwordErrorMessage;
    }
  }

  return returnObject;
}

// used
function isValidImageUrl(url) {
  const urlRegex = /^(https?):\/\/[^\s/$.?#].[^\s]*\.(jpg|jpeg|png|gif|bmp|tiff|webp|svg|ai|eps|pdf|jfif|pjpeg|pjp|ico|psd|raw|indd|cdr|dng)$/i;
  return urlRegex.test(url);
}

// used
function isValidVideoUrl(url) {
  const urlRegex = /^(https?):\/\/[^\s/$.?#].[^\s]*\.(mp4|webm|ogg|mov|avi|mkv|flv|wmv|3gp|mpeg|m4v|mts|vob|m2ts|ts|mpg|asf|rm|swf|divx|dat|mp2|qt|ogv|f4v)$/i;
  return urlRegex.test(url);
}

export {
  validateUsernameEmailPassword,
  isValidImageUrl,
  isValidVideoUrl,
};
