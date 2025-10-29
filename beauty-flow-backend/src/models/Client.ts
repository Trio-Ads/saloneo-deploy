import { Schema, model, Document, Types } from 'mongoose';

export interface IHairQuestionnaire {
  type?: string;
  thickness?: string;
  condition?: string;
  chemicalTreatments?: string[];
  concerns?: string[];
  washFrequency?: string;
  preferredStyles?: string[];
}

export interface ISkinQuestionnaire {
  type?: string;
  sensitivity?: string;
  concerns?: string[];
  allergies?: string[];
  currentProducts?: string[];
  goals?: string[];
}

export interface IClient extends Document {
  userId: Types.ObjectId;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  dateOfBirth?: Date;
  gender?: 'male' | 'female' | 'other';
  address?: string;
  preferences: {
    favoriteServices: Types.ObjectId[];
    preferredStylists: Types.ObjectId[];
    communicationPreferences: {
      smsReminders: boolean;
      emailMarketing: boolean;
      birthdayOffers: boolean;
    };
    hairQuestionnaire?: IHairQuestionnaire;
    skinQuestionnaire?: ISkinQuestionnaire;
  };
  loyaltyPoints: number;
  loyaltyHistory: Array<{
    points: number;
    reason: string;
    date: Date;
  }>;
  history: {
    lastVisit?: Date;
    totalVisits: number;
    totalSpent: number;
    averageSpent: number;
  };
  notes?: string;
  tags: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const hairQuestionnaireSchema = new Schema<IHairQuestionnaire>(
  {
    type: {
      type: String,
      enum: ['Raides', 'Ondulés', 'Bouclés', 'Crépus'],
    },
    thickness: {
      type: String,
      enum: ['Fins', 'Moyens', 'Épais'],
    },
    condition: {
      type: String,
      enum: ['Secs', 'Normaux', 'Gras', 'Mixtes'],
    },
    chemicalTreatments: [String],
    concerns: [String],
    washFrequency: String,
    preferredStyles: [String],
  },
  { _id: false }
);

const skinQuestionnaireSchema = new Schema<ISkinQuestionnaire>(
  {
    type: {
      type: String,
      enum: ['Sèche', 'Normale', 'Grasse', 'Mixte', 'Sensible'],
    },
    sensitivity: {
      type: String,
      enum: ['Faible', 'Modérée', 'Élevée'],
    },
    concerns: [String],
    allergies: [String],
    currentProducts: [String],
    goals: [String],
  },
  { _id: false }
);

const clientSchema = new Schema<IClient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    firstName: {
      type: String,
      required: [true, 'First name is required'],
      trim: true,
    },
    lastName: {
      type: String,
      required: [true, 'Last name is required'],
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    dateOfBirth: Date,
    gender: {
      type: String,
      enum: ['male', 'female', 'other'],
    },
    address: {
      type: String,
      trim: true,
    },
    preferences: {
      favoriteServices: [{
        type: Schema.Types.ObjectId,
        ref: 'Service',
      }],
      preferredStylists: [{
        type: Schema.Types.ObjectId,
        ref: 'TeamMember',
      }],
      communicationPreferences: {
        smsReminders: {
          type: Boolean,
          default: true,
        },
        emailMarketing: {
          type: Boolean,
          default: false,
        },
        birthdayOffers: {
          type: Boolean,
          default: false,
        },
      },
      hairQuestionnaire: hairQuestionnaireSchema,
      skinQuestionnaire: skinQuestionnaireSchema,
    },
    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },
    loyaltyHistory: [{
      points: {
        type: Number,
        required: true,
      },
      reason: {
        type: String,
        required: true,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    }],
    history: {
      lastVisit: Date,
      totalVisits: {
        type: Number,
        default: 0,
        min: 0,
      },
      totalSpent: {
        type: Number,
        default: 0,
        min: 0,
      },
      averageSpent: {
        type: Number,
        default: 0,
        min: 0,
      },
    },
    notes: {
      type: String,
      maxlength: 1000,
    },
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
clientSchema.index({ userId: 1, phone: 1 });
clientSchema.index({ userId: 1, lastName: 1, firstName: 1 });
clientSchema.index({ userId: 1, email: 1 });
clientSchema.index({ userId: 1, isActive: 1 });
clientSchema.index({ 'preferences.preferredStylists': 1 });

// Virtual for full name
clientSchema.virtual('fullName').get(function () {
  return `${this.firstName} ${this.lastName}`;
});

// Method to add loyalty points
clientSchema.methods.addLoyaltyPoints = function (points: number, reason: string) {
  this.loyaltyPoints += points;
  this.loyaltyHistory.push({
    points,
    reason,
    date: new Date(),
  });
  return this.save();
};

// Method to update visit history
clientSchema.methods.updateVisitHistory = function (amount: number) {
  this.history.lastVisit = new Date();
  this.history.totalVisits += 1;
  this.history.totalSpent += amount;
  this.history.averageSpent = this.history.totalSpent / this.history.totalVisits;
  return this.save();
};

export const Client = model<IClient>('Client', clientSchema);
