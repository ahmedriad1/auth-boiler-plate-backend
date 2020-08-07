const { Schema, model } = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'A user must have a name'],
      trim: true,
      maxlength: [70, 'Name cannot be longer than 70 characters'],
    },
    email: {
      type: String,
      required: [true, 'A user must have an email'],
      unique: [true, 'Email address is already taken'],
      lowercase: true,
      trim: true,
      validate: {
        validator(value) {
          // eslint-disable-next-line no-useless-escape
          return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
            value,
          );
        },
        message: 'Invalid email address',
      },
    },
    password: {
      type: String,
      required: [true, 'A user must have a password'],
      minlength: [8, 'Password must be at least 8 characters'],
      select: false,
    },
    confirm_password: {
      type: String,
      required: [true, 'A user must have a password'],
      validate: {
        validator(value) {
          return value === this.password;
        },
        message: 'Password confirmation does not match',
      },
    },
    password_changed_at: Date,
  },
  {
    timestamps: true,
  },
);

// before save, encrypt the password if it is modified
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) next();
  this.password = await bcrypt.hash(this.password, 12);
  this.confirm_password = undefined;
  next();
});

// before save, set passwordChangedAt to invalidate other jwt tokens
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || this.isNew) next();
  this.password_changed_at = Date.now() - 1000;
  next();
});

// method to check password
UserSchema.methods.checkPassword = function (password, originalPassword) {
  return bcrypt.compare(password, originalPassword);
};

/* method to check if the user changed his password after a certian
timestamp to invalidate other jwt tokens */
UserSchema.methods.changedPasswordAfter = function (jwtTimestamp) {
  if (this.password_changed_at) {
    const changedAt = parseInt(this.password_changed_at.getTime() / 1000, 10);
    return jwtTimestamp < changedAt;
  }
  return false;
};

// method to sign a jwt token
UserSchema.methods.signToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_TTL,
  });
};

module.exports = model('Users', UserSchema);
