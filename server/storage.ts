import db from "./database";
import { randomUUID } from "crypto";

export interface IStorage {
  getUserCount(): number;
  getUserByEmail(email: string): any | undefined;
  getUserById(id: string): any | undefined;
  getUsersByRivalCode(rivalCode: string): any[];
  createUser(user: { name: string; email: string; password: string; pwBatchId: string; rivalCode: string }): any;
  updateUserTheme(userId: string, theme: string): void;
  
  createLecture(lecture: { subject: string; number: string; name: string }): any;
  getLectures(): any[];
  getLectureCompletions(userId: string): string[];
  toggleLectureCompletion(lectureId: string, userId: string): boolean;
  
  createDpp(dpp: { subject: string; number: string; name: string }): any;
  getDpps(): any[];
  getDppCompletions(userId: string): string[];
  toggleDppCompletion(dppId: string, userId: string): boolean;
  
  createSchoolLesson(lesson: { subject: string; lessonNumber: string; lessonName: string; monthRange: string }): any;
  getSchoolLessons(): any[];
  getSchoolLessonCompletions(userId: string): string[];
  toggleSchoolLessonCompletion(lessonId: string, userId: string): boolean;
  
  createChatMessage(message: { userId: string; message: string }): any;
  getChatMessages(): any[];
  
  getOrCreateStreak(userId: string): any;
  updateStreak(userId: string, streak: number, lastActivityDate: string): void;
  getAllCompletionsForUser(userId: string): any[];

  initializeAchievements(): void;
  getAchievements(): any[];
  getUserAchievements(userId: string): any[];
  awardAchievement(userId: string, achievementId: string): boolean;
  hasUserEarned(userId: string, achievementId: string): boolean;

  initializeSyllabus(): void;
}

const SYLLABUS_DATA = {
  physics: {
    "Chapter 1: Units and Measurement": {
      lectures:[
        { number: "1", name: "Chapter 1: Dimensional Analysis" },
        { number: "2", name: "Chapter 1: Significant Figures" },
        { number: "3", name: "Chapter 1: Conservation of Errors" },
        { number: "4", name: "Chapter 1: Dimensions & Dimensional Analysis" },
        { number: "5", name: "Chapter 1: Error Analysis" },
        { number: "6", name: "Chapter 1: Measurement of Length, Mass, Time" },
        { number: "7", name: "Chapter 1: System of Units, Fundamental Quantities" },
      ],
      dpps: [
        { number: "1", name: "Chapter 1: Units and Measurement MCQ Quiz 1" },
        { number: "2", name: "Chapter 1: Units and Measurement MCQ Quiz 2" },
        { number: "3", name: "Chapter 1: Units and Measurement MCQ Quiz 3" },
        { number: "4", name: "Chapter 1: Units and Measurement MCQ Quiz 4" },
        { number: "5", name: "Chapter 1: Units and Measurement MCQ Quiz 5" },
        { number: "6", name: "Chapter 1: Units and Measurement MCQ Quiz 6" },
      ],
    },
    "Chapter 2: Mathematical Methods": {
      lectures: [
        { number: "1", name: "Chapter 2: Scalars & Vectors" },
        { number: "2", name: "Chapter 2: Vector Operations: Addition & Subtraction" },
        { number: "3", name: "Chapter 2: Multiplication of Vectors: Scalar Product" },
        { number: "4", name: "Chapter 2: Multiplication of Vectors: Vector Product" },
        { number: "5", name: "Chapter 2: Differentiation" },
        { number: "6", name: "Chapter 2: Integration" },
        { number: "7", name: "Chapter 2: Vectors, Differentiation, Integration" },
      ],
      dpps: [
        { number: "1", name: "Chapter 2: Mathematical Methods MCQ Quiz 1" },
        { number: "2", name: "Chapter 2: Mathematical Methods MCQ Quiz 2" },
        { number: "3", name: "Chapter 2: Mathematical Methods MCQ Quiz 3" },
        { number: "4", name: "Chapter 2: Mathematical Methods MCQ Quiz 4" },
        { number: "5", name: "Chapter 2: Mathematical Methods MCQ Quiz 5" },
        { number: "6", name: "Chapter 2: Mathematical Methods MCQ Quiz 6" },
      ],
    },
    "Chapter 3: Motion in Plane": {
      lectures: [
        { number: "1", name: "Chapter 3: Uniform Circular Motion" },
        { number: "2", name: "Chapter 3: Vertical Circular Motion" },
        { number: "3", name: "Chapter 3: Projectile Motion" },
        { number: "4", name: "Chapter 3: Equations of Motion" },
        { number: "5", name: "Chapter 3: Relative Velocity" },
        { number: "6", name: "Chapter 3: Position & Displacement" },
        { number: "7", name: "Chapter 3: Rectilinear Motion" },
      ],
      dpps: [
        { number: "1", name: "Chapter 3: Motion in Plane MCQ Quiz 1" },
        { number: "2", name: "Chapter 3: Motion in Plane MCQ Quiz 2" },
        { number: "3", name: "Chapter 3: Motion in Plane MCQ Quiz 3" },
        { number: "4", name: "Chapter 3: Motion in Plane MCQ Quiz 4" },
        { number: "5", name: "Chapter 3: Motion in Plane MCQ Quiz 5" },
        { number: "6", name: "Chapter 3: Motion in Plane MCQ Quiz 6" },
      ],
    },
    "Chapter 4: Law of Motion": {
      lectures: [
        { number: "1", name: "Chapter 4: Centre of Gravity" },
        { number: "2", name: "Chapter 4: Centre of Mass" },
        { number: "3", name: "Chapter 4: Equilibrium" },
        { number: "4", name: "Chapter 4: Torque Couple" },
        { number: "5", name: "Chapter 4: Newton's Laws of Motion" },
        { number: "6", name: "Chapter 4: Friction" },
        { number: "7", name: "Chapter 4: Collision in Four Dimensions" },
      ],
      dpps: [
        { number: "1", name: "Chapter 4: Law of Motion MCQ Quiz 1" },
        { number: "2", name: "Chapter 4: Law of Motion MCQ Quiz 2" },
        { number: "3", name: "Chapter 4: Law of Motion MCQ Quiz 3" },
        { number: "4", name: "Chapter 4: Law of Motion MCQ Quiz 4" },
        { number: "5", name: "Chapter 4: Law of Motion MCQ Quiz 5" },
        { number: "6", name: "Chapter 4: Law of Motion MCQ Quiz 6" },
      ],
    },
    "Chapter 5: Gravitation": {
      lectures: [
        { number: "1", name: "Chapter 5: Universal Gravitation" },
        { number: "2", name: "Chapter 5: Gravitational Field" },
        { number: "3", name: "Chapter 5: Gravitational Potential" },
        { number: "4", name: "Chapter 5: Gravitational Potential Energy" },
        { number: "5", name: "Chapter 5: Variation in g" },
        { number: "6", name: "Chapter 5: Orbital Velocity" },
        { number: "7", name: "Chapter 5: Escape Velocity" },
      ],
      dpps: [
        { number: "1", name: "Chapter 5: Gravitation MCQ Quiz 1" },
        { number: "2", name: "Chapter 5: Gravitation MCQ Quiz 2" },
        { number: "3", name: "Chapter 5: Gravitation MCQ Quiz 3" },
        { number: "4", name: "Chapter 5: Gravitation MCQ Quiz 4" },
        { number: "5", name: "Chapter 5: Gravitation MCQ Quiz 5" },
        { number: "6", name: "Chapter 5: Gravitation MCQ Quiz 6" },
      ],
    },
    "Chapter 6: Mechanical Properties of Solids": {
      lectures: [
        { number: "1", name: "Chapter 6: Elasticity" },
        { number: "2", name: "Chapter 6: Stress Strain Curve" },
        { number: "3", name: "Chapter 6: Moduli of Elasticity" },
        { number: "4", name: "Chapter 6: Kinetic Friction" },
        { number: "5", name: "Chapter 6: Rolling Friction" },
        { number: "6", name: "Chapter 6: Young's Modulus" },
        { number: "7", name: "Chapter 6: Poisson's Ratio" },
      ],
      dpps: [
        { number: "1", name: "Chapter 6: Mechanical Properties of Solids MCQ Quiz 1" },
        { number: "2", name: "Chapter 6: Mechanical Properties of Solids MCQ Quiz 2" },
        { number: "3", name: "Chapter 6: Mechanical Properties of Solids MCQ Quiz 3" },
        { number: "4", name: "Chapter 6: Mechanical Properties of Solids MCQ Quiz 4" },
        { number: "5", name: "Chapter 6: Mechanical Properties of Solids MCQ Quiz 5" },
        { number: "6", name: "Chapter 6: Mechanical Properties of Solids MCQ Quiz 6" },
      ],
    },
    "Chapter 7: Thermal Properties of Matter": {
      lectures: [
        { number: "1", name: "Chapter 7: Temperature and Heat" },
        { number: "2", name: "Chapter 7: Thermal Expansion" },
        { number: "3", name: "Chapter 7: Linear Expansion" },
        { number: "4", name: "Chapter 7: Surface and Volume Expansion" },
        { number: "5", name: "Chapter 7: Calorimetry" },
        { number: "6", name: "Chapter 7: Heat Capacity" },
        { number: "7", name: "Chapter 7: Latent Heat" },
        { number: "8", name: "Chapter 7: Mode of Heat Transfer" },
      ],
      dpps: [
        { number: "1", name: "Chapter 7: Thermal Properties of Matter MCQ Quiz 1" },
        { number: "2", name: "Chapter 7: Thermal Properties of Matter MCQ Quiz 2" },
        { number: "3", name: "Chapter 7: Thermal Properties of Matter MCQ Quiz 3" },
        { number: "4", name: "Chapter 7: Thermal Properties of Matter MCQ Quiz 4" },
        { number: "5", name: "Chapter 7: Thermal Properties of Matter MCQ Quiz 5" },
        { number: "6", name: "Chapter 7: Thermal Properties of Matter MCQ Quiz 6" },
      ],
    },
    "Chapter 8: Sound": {
      lectures: [
        { number: "1", name: "Chapter 8: Types of Waves" },
        { number: "2", name: "Chapter 8: Common Properties of Waves" },
        { number: "3", name: "Chapter 8: Mathematical Expression of Wave" },
        { number: "4", name: "Chapter 8: Acoustics" },
        { number: "5", name: "Chapter 8: Sound Intensity and Level" },
        { number: "6", name: "Chapter 8: Doppler Effect" },
        { number: "7", name: "Chapter 8: Standing Waves" },
      ],
      dpps: [
        { number: "1", name: "Chapter 8: Sound MCQ Quiz 1" },
        { number: "2", name: "Chapter 8: Sound MCQ Quiz 2" },
        { number: "3", name: "Chapter 8: Sound MCQ Quiz 3" },
        { number: "4", name: "Chapter 8: Sound MCQ Quiz 4" },
        { number: "5", name: "Chapter 8: Sound MCQ Quiz 5" },
        { number: "6", name: "Chapter 8: Sound MCQ Quiz 6" },
      ],
    },
    "Chapter 9: Optics": {
      lectures: [
        { number: "1", name: "Chapter 9: Laws of Refraction" },
        { number: "2", name: "Chapter 9: Image Formation of Concave Mirror" },
        { number: "3", name: "Chapter 9: Refraction" },
        { number: "4", name: "Chapter 9: Total Internal Reflection" },
        { number: "5", name: "Chapter 9: Refraction at a Curved Surface" },
        { number: "6", name: "Chapter 9: Lenses and Lens Formula" },
        { number: "7", name: "Chapter 9: Optical Instruments" },
      ],
      dpps: [
        { number: "1", name: "Chapter 9: Optics MCQ Quiz 1" },
        { number: "2", name: "Chapter 9: Optics MCQ Quiz 2" },
        { number: "3", name: "Chapter 9: Optics MCQ Quiz 3" },
        { number: "4", name: "Chapter 9: Optics MCQ Quiz 4" },
        { number: "5", name: "Chapter 9: Optics MCQ Quiz 5" },
        { number: "6", name: "Chapter 9: Optics MCQ Quiz 6" },
      ],
    },
  },
  chemistry: {
    "Chapter 1: Some Basic Concepts Of Chemistry": {
      lectures: [
        { number: "1", name: "Chapter 1: Atomic Mass" },
        { number: "2", name: "Chapter 1: Mole Concept" },
        { number: "3", name: "Chapter 1: Valence" },
        { number: "4", name: "Chapter 1: Oxidation State" },
        { number: "5", name: "Chapter 1: Balancing Equations" },
        { number: "6", name: "Chapter 1: Stoichiometry" },
        { number: "7", name: "Chapter 1: Concentration" },
      ],
      dpps: [
        { number: "1", name: "Chapter 1: Some Basic Concepts MCQ Quiz 1" },
        { number: "2", name: "Chapter 1: Some Basic Concepts MCQ Quiz 2" },
        { number: "3", name: "Chapter 1: Some Basic Concepts MCQ Quiz 3" },
        { number: "4", name: "Chapter 1: Some Basic Concepts MCQ Quiz 4" },
        { number: "5", name: "Chapter 1: Some Basic Concepts MCQ Quiz 5" },
        { number: "6", name: "Chapter 1: Some Basic Concepts MCQ Quiz 6" },
      ],
    },
    "Chapter 2: Introduction to Analytical Chemistry": {
      lectures: [
        { number: "1", name: "Chapter 2: Classification of Analytical Procedures" },
        { number: "2", name: "Chapter 2: Qualitative Analysis" },
        { number: "3", name: "Chapter 2: Quantitative Analysis" },
        { number: "4", name: "Chapter 2: Sample Preparation" },
        { number: "5", name: "Chapter 2: Measurement and Uncertainty" },
        { number: "6", name: "Chapter 2: Analytical Methods" },
        { number: "7", name: "Chapter 2: Lab Safety" },
      ],
      dpps: [
        { number: "1", name: "Chapter 2: Intro to Analytical Chemistry MCQ Quiz 1" },
        { number: "2", name: "Chapter 2: Intro to Analytical Chemistry MCQ Quiz 2" },
        { number: "3", name: "Chapter 2: Intro to Analytical Chemistry MCQ Quiz 3" },
        { number: "4", name: "Chapter 2: Intro to Analytical Chemistry MCQ Quiz 4" },
        { number: "5", name: "Chapter 2: Intro to Analytical Chemistry MCQ Quiz 5" },
        { number: "6", name: "Chapter 2: Intro to Analytical Chemistry MCQ Quiz 6" },
      ],
    },
    "Chapter 3: Basic Analytical Techniques": {
      lectures: [
        { number: "1", name: "Chapter 3: Gravimetric Analysis" },
        { number: "2", name: "Chapter 3: Precipitation Methods" },
        { number: "3", name: "Chapter 3: Separations and Extractions" },
        { number: "4", name: "Chapter 3: Filtration and Drying" },
        { number: "5", name: "Chapter 3: Spectroscopic Techniques" },
        { number: "6", name: "Chapter 3: Chromatography" },
        { number: "7", name: "Chapter 3: Error Analysis" },
      ],
      dpps: [
        { number: "1", name: "Chapter 3: Basic Analytical Techniques MCQ Quiz 1" },
        { number: "2", name: "Chapter 3: Basic Analytical Techniques MCQ Quiz 2" },
        { number: "3", name: "Chapter 3: Basic Analytical Techniques MCQ Quiz 3" },
        { number: "4", name: "Chapter 3: Basic Analytical Techniques MCQ Quiz 4" },
        { number: "5", name: "Chapter 3: Basic Analytical Techniques MCQ Quiz 5" },
        { number: "6", name: "Chapter 3: Basic Analytical Techniques MCQ Quiz 6" },
      ],
    },
    "Chapter 4: Structure of Atom": {
      lectures: [
        { number: "1", name: "Chapter 4: Dalton's Atomic Theory" },
        { number: "2", name: "Chapter 4: Bohr's Atomic Model" },
        { number: "3", name: "Chapter 4: Quantum Numbers" },
        { number: "4", name: "Chapter 4: Orbitals and Probability" },
        { number: "5", name: "Chapter 4: Electron Configuration" },
        { number: "6", name: "Chapter 4: Aufbau Principle" },
        { number: "7", name: "Chapter 4: Pauli's Exclusion Principle" },
      ],
      dpps: [
        { number: "1", name: "Chapter 4: Structure of Atom MCQ Quiz 1" },
        { number: "2", name: "Chapter 4: Structure of Atom MCQ Quiz 2" },
        { number: "3", name: "Chapter 4: Structure of Atom MCQ Quiz 3" },
        { number: "4", name: "Chapter 4: Structure of Atom MCQ Quiz 4" },
        { number: "5", name: "Chapter 4: Structure of Atom MCQ Quiz 5" },
        { number: "6", name: "Chapter 4: Structure of Atom MCQ Quiz 6" },
      ],
    },
    "Chapter 5: Chemical Bonding": {
      lectures: [
        { number: "1", name: "Chapter 5: Ionic Bonding" },
        { number: "2", name: "Chapter 5: Covalent Bonding" },
        { number: "3", name: "Chapter 5: Coordinate Covalent Bond" },
        { number: "4", name: "Chapter 5: VSEPR Theory" },
        { number: "5", name: "Chapter 5: Hybridization" },
        { number: "6", name: "Chapter 5: Molecular Geometry" },
        { number: "7", name: "Chapter 5: Polarity and Intermolecular Forces" },
      ],
      dpps: [
        { number: "1", name: "Chapter 5: Chemical Bonding MCQ Quiz 1" },
        { number: "2", name: "Chapter 5: Chemical Bonding MCQ Quiz 2" },
        { number: "3", name: "Chapter 5: Chemical Bonding MCQ Quiz 3" },
        { number: "4", name: "Chapter 5: Chemical Bonding MCQ Quiz 4" },
        { number: "5", name: "Chapter 5: Chemical Bonding MCQ Quiz 5" },
        { number: "6", name: "Chapter 5: Chemical Bonding MCQ Quiz 6" },
      ],
    },
    "Chapter 6: Redox Reaction": {
      lectures: [
        { number: "1", name: "Chapter 6: Oxidation State" },
        { number: "2", name: "Chapter 6: Oxidation and Reduction" },
        { number: "3", name: "Chapter 6: Redox Reactions" },
        { number: "4", name: "Chapter 6: Balancing Redox Equations" },
        { number: "5", name: "Chapter 6: Half-Reaction Method" },
        { number: "6", name: "Chapter 6: Electrochemistry Basics" },
        { number: "7", name: "Chapter 6: Applications of Redox" },
      ],
      dpps: [
        { number: "1", name: "Chapter 6: Redox Reaction MCQ Quiz 1" },
        { number: "2", name: "Chapter 6: Redox Reaction MCQ Quiz 2" },
        { number: "3", name: "Chapter 6: Redox Reaction MCQ Quiz 3" },
        { number: "4", name: "Chapter 6: Redox Reaction MCQ Quiz 4" },
        { number: "5", name: "Chapter 6: Redox Reaction MCQ Quiz 5" },
        { number: "6", name: "Chapter 6: Redox Reaction MCQ Quiz 6" },
      ],
    },
    "Chapter 7: Modern Periodic Table": {
      lectures: [
        { number: "1", name: "Chapter 7: History of Periodic Table" },
        { number: "2", name: "Chapter 7: Blocks and Periods" },
        { number: "3", name: "Chapter 7: Periodic Trends" },
        { number: "4", name: "Chapter 7: Atomic Radius" },
        { number: "5", name: "Chapter 7: Ionization Energy" },
        { number: "6", name: "Chapter 7: Electron Affinity" },
        { number: "7", name: "Chapter 7: Electronegativity Trends" },
      ],
      dpps: [
        { number: "1", name: "Chapter 7: Modern Periodic Table MCQ Quiz 1" },
        { number: "2", name: "Chapter 7: Modern Periodic Table MCQ Quiz 2" },
        { number: "3", name: "Chapter 7: Modern Periodic Table MCQ Quiz 3" },
        { number: "4", name: "Chapter 7: Modern Periodic Table MCQ Quiz 4" },
        { number: "5", name: "Chapter 7: Modern Periodic Table MCQ Quiz 5" },
        { number: "6", name: "Chapter 7: Modern Periodic Table MCQ Quiz 6" },
      ],
    },
    "Chapter 8: Elements of Group I and 2": {
      lectures: [
        { number: "1", name: "Chapter 8: General Properties of Alkali Metals" },
        { number: "2", name: "Chapter 8: Lithium" },
        { number: "3", name: "Chapter 8: Sodium and Potassium" },
        { number: "4", name: "Chapter 8: General Properties of Alkaline Earth Metals" },
        { number: "5", name: "Chapter 8: Magnesium and Calcium" },
        { number: "6", name: "Chapter 8: Barium" },
        { number: "7", name: "Chapter 8: Uses and Applications" },
      ],
      dpps: [
        { number: "1", name: "Chapter 8: Elements of Group I and 2 MCQ Quiz 1" },
        { number: "2", name: "Chapter 8: Elements of Group I and 2 MCQ Quiz 2" },
        { number: "3", name: "Chapter 8: Elements of Group I and 2 MCQ Quiz 3" },
        { number: "4", name: "Chapter 8: Elements of Group I and 2 MCQ Quiz 4" },
        { number: "5", name: "Chapter 8: Elements of Group I and 2 MCQ Quiz 5" },
        { number: "6", name: "Chapter 8: Elements of Group I and 2 MCQ Quiz 6" },
      ],
    },
    "Chapter 9: Elements of Group 13/14/15": {
      lectures: [
        { number: "1", name: "Chapter 9: Group 13: Boron and Aluminum" },
        { number: "2", name: "Chapter 9: Properties of Group 13 Elements" },
        { number: "3", name: "Chapter 9: Group 14: Carbon and Silicon" },
        { number: "4", name: "Chapter 9: Properties of Group 14 Elements" },
        { number: "5", name: "Chapter 9: Group 15: Nitrogen and Phosphorus" },
        { number: "6", name: "Chapter 9: Properties of Group 15 Elements" },
        { number: "7", name: "Chapter 9: Applications and Uses" },
      ],
      dpps: [
        { number: "1", name: "Chapter 9: Elements of Group 13/14/15 MCQ Quiz 1" },
        { number: "2", name: "Chapter 9: Elements of Group 13/14/15 MCQ Quiz 2" },
        { number: "3", name: "Chapter 9: Elements of Group 13/14/15 MCQ Quiz 3" },
        { number: "4", name: "Chapter 9: Elements of Group 13/14/15 MCQ Quiz 4" },
        { number: "5", name: "Chapter 9: Elements of Group 13/14/15 MCQ Quiz 5" },
        { number: "6", name: "Chapter 9: Elements of Group 13/14/15 MCQ Quiz 6" },
      ],
    },
    "Chapter 10: States of Matter": {
      lectures: [
        { number: "1", name: "Chapter 10: Intermolecular Forces" },
        { number: "2", name: "Chapter 10: Solid State" },
        { number: "3", name: "Chapter 10: Types of Solids" },
        { number: "4", name: "Chapter 10: Liquid State" },
        { number: "5", name: "Chapter 10: Surface Tension and Viscosity" },
        { number: "6", name: "Chapter 10: Gaseous State" },
        { number: "7", name: "Chapter 10: Gas Laws and Kinetic Theory" },
      ],
      dpps: [
        { number: "1", name: "Chapter 10: States of Matter MCQ Quiz 1" },
        { number: "2", name: "Chapter 10: States of Matter MCQ Quiz 2" },
        { number: "3", name: "Chapter 10: States of Matter MCQ Quiz 3" },
        { number: "4", name: "Chapter 10: States of Matter MCQ Quiz 4" },
        { number: "5", name: "Chapter 10: States of Matter MCQ Quiz 5" },
        { number: "6", name: "Chapter 10: States of Matter MCQ Quiz 6" },
      ],
    },
    "Chapter 11: Adsorption and Colloids": {
      lectures: [
        { number: "1", name: "Chapter 11: Adsorption" },
        { number: "2", name: "Chapter 11: Types of Adsorption" },
        { number: "3", name: "Chapter 11: Adsorption Isotherms" },
        { number: "4", name: "Chapter 11: Colloids" },
        { number: "5", name: "Chapter 11: Types of Colloidal Solutions" },
        { number: "6", name: "Chapter 11: Properties of Colloids" },
        { number: "7", name: "Chapter 11: Coagulation and Stability" },
      ],
      dpps: [
        { number: "1", name: "Chapter 11: Adsorption and Colloids MCQ Quiz 1" },
        { number: "2", name: "Chapter 11: Adsorption and Colloids MCQ Quiz 2" },
        { number: "3", name: "Chapter 11: Adsorption and Colloids MCQ Quiz 3" },
        { number: "4", name: "Chapter 11: Adsorption and Colloids MCQ Quiz 4" },
        { number: "5", name: "Chapter 11: Adsorption and Colloids MCQ Quiz 5" },
        { number: "6", name: "Chapter 11: Adsorption and Colloids MCQ Quiz 6" },
      ],
    },
    "Chapter 12: Chemical Equilibrium": {
      lectures: [
        { number: "1", name: "Chapter 12: Introduction" },
        { number: "2", name: "Chapter 12: Equilibrium in Chemical Process" },
        { number: "3", name: "Chapter 12: Relationship between Partial Pressure and Concentration" },
        { number: "4", name: "Chapter 12: Application of Equilibrium Constant" },
        { number: "5", name: "Chapter 12: Equilibrium Constant" },
        { number: "6", name: "Chapter 12: Le Chatelier's Principle" },
        { number: "7", name: "Chapter 12: Equilibrium Calculations" },
      ],
      dpps: [
        { number: "1", name: "Chapter 12: Chemical Equilibrium MCQ Quiz 1" },
        { number: "2", name: "Chapter 12: Chemical Equilibrium MCQ Quiz 2" },
        { number: "3", name: "Chapter 12: Chemical Equilibrium MCQ Quiz 3" },
        { number: "4", name: "Chapter 12: Chemical Equilibrium MCQ Quiz 4" },
        { number: "5", name: "Chapter 12: Chemical Equilibrium MCQ Quiz 5" },
        { number: "6", name: "Chapter 12: Chemical Equilibrium MCQ Quiz 6" },
      ],
    },
    "Chapter 13: Nuclear Chemistry and Radioactivity": {
      lectures: [
        { number: "1", name: "Chapter 13: Introduction" },
        { number: "2", name: "Chapter 13: Classification of Nuclides" },
        { number: "3", name: "Chapter 13: Nuclear Potential" },
        { number: "4", name: "Chapter 13: Radioactive Decay" },
        { number: "5", name: "Chapter 13: Nuclear Reactions" },
        { number: "6", name: "Chapter 13: Half-Life and Decay Constants" },
        { number: "7", name: "Chapter 13: Applications of Radioactivity" },
      ],
      dpps: [
        { number: "1", name: "Chapter 13: Nuclear Chemistry MCQ Quiz 1" },
        { number: "2", name: "Chapter 13: Nuclear Chemistry MCQ Quiz 2" },
        { number: "3", name: "Chapter 13: Nuclear Chemistry MCQ Quiz 3" },
        { number: "4", name: "Chapter 13: Nuclear Chemistry MCQ Quiz 4" },
        { number: "5", name: "Chapter 13: Nuclear Chemistry MCQ Quiz 5" },
        { number: "6", name: "Chapter 13: Nuclear Chemistry MCQ Quiz 6" },
      ],
    },
  },
  mathematics: {
    "Chapter 1: Angle and its Measurement": {
      lectures: [
        { number: "1", name: "Chapter 1: Types of Angles" },
        { number: "2", name: "Chapter 1: Relation between degree & radian measurements" },
        { number: "3", name: "Chapter 1: Length of arc & Area of sector" },
        { number: "4", name: "Chapter 1: Problem Based on Clock" },
        { number: "5", name: "Chapter 1: Angle and its Measurement" },
        { number: "6", name: "Chapter 1: Unit Conversion" },
        { number: "7", name: "Chapter 1: Applications of Angle Measurement" },
      ],
      dpps: [
        { number: "1", name: "Chapter 1: Angle and its Measurement MCQ Quiz 1" },
        { number: "2", name: "Chapter 1: Angle and its Measurement MCQ Quiz 2" },
        { number: "3", name: "Chapter 1: Angle and its Measurement MCQ Quiz 3" },
        { number: "4", name: "Chapter 1: Angle and its Measurement MCQ Quiz 4" },
        { number: "5", name: "Chapter 1: Angle and its Measurement MCQ Quiz 5" },
        { number: "6", name: "Chapter 1: Angle and its Measurement MCQ Quiz 6" },
      ],
    },
    "Chapter 2: Trigonometry - I": {
      lectures: [
        { number: "1", name: "Chapter 2: Trigonometry using unit circle" },
        { number: "2", name: "Chapter 2: Sign of trigonometry functions" },
        { number: "3", name: "Chapter 2: Trigonometric Identities" },
        { number: "4", name: "Chapter 2: Graph of Trigonometric Functions" },
        { number: "5", name: "Chapter 2: Polar Coordinates" },
        { number: "6", name: "Chapter 2: Trigonometric Ratios" },
        { number: "7", name: "Chapter 2: Trigonometric Equations" },
      ],
      dpps: [
        { number: "1", name: "Chapter 2: Trigonometry - I MCQ Quiz 1" },
        { number: "2", name: "Chapter 2: Trigonometry - I MCQ Quiz 2" },
        { number: "3", name: "Chapter 2: Trigonometry - I MCQ Quiz 3" },
        { number: "4", name: "Chapter 2: Trigonometry - I MCQ Quiz 4" },
        { number: "5", name: "Chapter 2: Trigonometry - I MCQ Quiz 5" },
        { number: "6", name: "Chapter 2: Trigonometry - I MCQ Quiz 6" },
      ],
    },
    "Chapter 3: Sets and Relations": {
      lectures: [
        { number: "1", name: "Chapter 3: Representation of Set, Types of Set" },
        { number: "2", name: "Chapter 3: Operation on sets, Venn Diagram" },
        { number: "3", name: "Chapter 3: Intervals, Rule of Inequality" },
        { number: "4", name: "Chapter 3: Wavy curve Method" },
        { number: "5", name: "Chapter 3: Types of Relation" },
        { number: "6", name: "Chapter 3: Relation Practice Question" },
      ],
      dpps: [
        { number: "1", name: "Chapter 3: Sets and Relations MCQ Quiz 1" },
        { number: "2", name: "Chapter 3: Sets and Relations MCQ Quiz 2" },
        { number: "3", name: "Chapter 3: Sets and Relations MCQ Quiz 3" },
        { number: "4", name: "Chapter 3: Sets and Relations MCQ Quiz 4" },
        { number: "5", name: "Chapter 3: Sets and Relations MCQ Quiz 5" },
        { number: "6", name: "Chapter 3: Sets and Relations MCQ Quiz 6" },
      ],
    },
    "Chapter 4: Determinants and Matrices": {
      lectures: [
        { number: "1", name: "Chapter 4: Order of Matrices, Types of Matrices" },
        { number: "2", name: "Chapter 4: Question on Properties of Determinants" },
        { number: "3", name: "Chapter 4: Application of Determinant" },
        { number: "4", name: "Chapter 4: Types of Matrices" },
        { number: "5", name: "Chapter 4: Algebra of Matrices" },
        { number: "6", name: "Chapter 4: Question on Matrices" },
      ],
      dpps: [
        { number: "1", name: "Chapter 4: Determinants and Matrices MCQ Quiz 1" },
        { number: "2", name: "Chapter 4: Determinants and Matrices MCQ Quiz 2" },
        { number: "3", name: "Chapter 4: Determinants and Matrices MCQ Quiz 3" },
        { number: "4", name: "Chapter 4: Determinants and Matrices MCQ Quiz 4" },
        { number: "5", name: "Chapter 4: Determinants and Matrices MCQ Quiz 5" },
        { number: "6", name: "Chapter 4: Determinants and Matrices MCQ Quiz 6" },
      ],
    },
    "Chapter 5: Complex Numbers": {
      lectures: [
        { number: "1", name: "Chapter 5: Equality of Complex Number, Conjugate of Complex Number" },
        { number: "2", name: "Chapter 5: Algebra of Complex Number, Power of iota" },
        { number: "3", name: "Chapter 5: Argand Diagram, Modulus and Argument of Complex Number" },
        { number: "4", name: "Chapter 5: Polar form and Exponential form of Complex Number" },
        { number: "5", name: "Chapter 5: Cubic root of Unity" },
        { number: "6", name: "Chapter 5: De Moivres Theorem" },
      ],
      dpps: [
        { number: "1", name: "Chapter 5: Complex Numbers MCQ Quiz 1" },
        { number: "2", name: "Chapter 5: Complex Numbers MCQ Quiz 2" },
        { number: "3", name: "Chapter 5: Complex Numbers MCQ Quiz 3" },
        { number: "4", name: "Chapter 5: Complex Numbers MCQ Quiz 4" },
        { number: "5", name: "Chapter 5: Complex Numbers MCQ Quiz 5" },
        { number: "6", name: "Chapter 5: Complex Numbers MCQ Quiz 6" },
      ],
    },
    "Chapter 6: Sequences and Series": {
      lectures: [
        { number: "1", name: "Chapter 6: Sum of Series" },
        { number: "2", name: "Chapter 6: Harmonic Progression (HP)" },
        { number: "3", name: "Chapter 6: Arithmetic Geometric Progression" },
        { number: "4", name: "Chapter 6: Relation Between AM, GM and HM" },
        { number: "5", name: "Chapter 6: Geometric Progression | Recorded" },
        { number: "6", name: "Chapter 6: Arithmetic Progression | Recorded" },
      ],
      dpps: [
        { number: "1", name: "Chapter 6: Sequences and Series MCQ Quiz 1" },
        { number: "2", name: "Chapter 6: Sequences and Series MCQ Quiz 2" },
        { number: "3", name: "Chapter 6: Sequences and Series MCQ Quiz 3" },
        { number: "4", name: "Chapter 6: Sequences and Series MCQ Quiz 4" },
        { number: "5", name: "Chapter 6: Sequences and Series MCQ Quiz 5" },
        { number: "6", name: "Chapter 6: Sequences and Series MCQ Quiz 6" },
      ],
    },
    "Chapter 7: Trigonometry - II": {
      lectures: [
        { number: "1", name: "Chapter 7: Trigonometric functions of sum and difference of two angles" },
        { number: "2", name: "Chapter 7: Trigonometric function of Allied Angle" },
        { number: "3", name: "Chapter 7: Trigonometric function of Multiple Angle" },
        { number: "4", name: "Chapter 7: Trigonometric function of Half Angle" },
        { number: "5", name: "Chapter 7: Trigonometric function of angle of Triangle" },
        { number: "6", name: "Chapter 7: Trigonometric function of angle of Triangle" },
      ],
      dpps: [
        { number: "1", name: "Chapter 7: Trigonometry - II MCQ Quiz 1" },
        { number: "2", name: "Chapter 7: Trigonometry - II MCQ Quiz 2" },
        { number: "3", name: "Chapter 7: Trigonometry - II MCQ Quiz 3" },
        { number: "4", name: "Chapter 7: Trigonometry - II MCQ Quiz 4" },
        { number: "5", name: "Chapter 7: Trigonometry - II MCQ Quiz 5" },
        { number: "6", name: "Chapter 7: Trigonometry - II MCQ Quiz 6" },
      ],
    },
    "Chapter 8: Permutations and Combination": {
      lectures: [
        { number: "1", name: "Chapter 8: Factorial" },
        { number: "2", name: "Chapter 8: Fundamental Principal of Counting, Permutation" },
        { number: "3", name: "Chapter 8: Combination, Geometry Based Question" },
        { number: "4", name: "Chapter 8: Permutation of Identical Objects" },
        { number: "5", name: "Chapter 8: Circular Permutation" },
        { number: "6", name: "Chapter 8: All possible Selection, Number of Divisors and the if" },
      ],
      dpps: [
        { number: "1", name: "Chapter 8: Permutations and Combination MCQ Quiz 1" },
        { number: "2", name: "Chapter 8: Permutations and Combination MCQ Quiz 2" },
        { number: "3", name: "Chapter 8: Permutations and Combination MCQ Quiz 3" },
        { number: "4", name: "Chapter 8: Permutations and Combination MCQ Quiz 4" },
        { number: "5", name: "Chapter 8: Permutations and Combination MCQ Quiz 5" },
        { number: "6", name: "Chapter 8: Permutations and Combination MCQ Quiz 6" },
      ],
    },
    "Chapter 9: Methods of Induction and Binomial Theorem": {
      lectures: [
        { number: "1", name: "Chapter 9: Mathematical Induction" },
        { number: "2", name: "Chapter 9: Pascal's Triangle" },
        { number: "3", name: "Chapter 9: Binomial Theorem" },
        { number: "4", name: "Chapter 9: Binomial Theorem (Part 2)" },
        { number: "5", name: "Chapter 9: Middle Term" },
        { number: "6", name: "Chapter 9: Independent Term" },
      ],
      dpps: [
        { number: "1", name: "Chapter 9: Methods of Induction and Binomial Theorem MCQ Quiz 1" },
        { number: "2", name: "Chapter 9: Methods of Induction and Binomial Theorem MCQ Quiz 2" },
        { number: "3", name: "Chapter 9: Methods of Induction and Binomial Theorem MCQ Quiz 3" },
        { number: "4", name: "Chapter 9: Methods of Induction and Binomial Theorem MCQ Quiz 4" },
        { number: "5", name: "Chapter 9: Methods of Induction and Binomial Theorem MCQ Quiz 5" },
        { number: "6", name: "Chapter 9: Methods of Induction and Binomial Theorem MCQ Quiz 6" },
      ],
    },
    "Chapter 10: Straight Line": {
      lectures: [
        { number: "1", name: "Chapter 10: Scope of a Straight Line" },
        { number: "2", name: "Chapter 10: Equation of a Straight Line" },
        { number: "3", name: "Chapter 10: Conditions of Two Line" },
        { number: "4", name: "Chapter 10: Concurrent lines" },
        { number: "5", name: "Chapter 10: Distance Between Two Parallel Lines" },
        { number: "6", name: "Chapter 10: Perpendicular Bisector" },
        { number: "7", name: "Chapter 10: Foot of Perpendicular" },
      ],
      dpps: [
        { number: "1", name: "Chapter 10: Straight Line MCQ Quiz 1" },
        { number: "2", name: "Chapter 10: Straight Line MCQ Quiz 2" },
        { number: "3", name: "Chapter 10: Straight Line MCQ Quiz 3" },
        { number: "4", name: "Chapter 10: Straight Line MCQ Quiz 4" },
        { number: "5", name: "Chapter 10: Straight Line MCQ Quiz 5" },
        { number: "6", name: "Chapter 10: Straight Line MCQ Quiz 6" },
      ],
    },
    "Chapter 11: Circle": {
      lectures: [
        { number: "1", name: "Chapter 11: General Equation of Circle" },
        { number: "2", name: "Chapter 11: Diameter form of a Circle" },
        { number: "3", name: "Chapter 11: Parametric Form of a circle in Special Cases" },
        { number: "4", name: "Chapter 11: Length of Tangent" },
        { number: "5", name: "Chapter 11: Director Circle" },
        { number: "6", name: "Chapter 11: Tangent to Circle" },
      ],
      dpps: [
        { number: "1", name: "Chapter 11: Circle MCQ Quiz 1" },
        { number: "2", name: "Chapter 11: Circle MCQ Quiz 2" },
        { number: "3", name: "Chapter 11: Circle MCQ Quiz 3" },
        { number: "4", name: "Chapter 11: Circle MCQ Quiz 4" },
        { number: "5", name: "Chapter 11: Circle MCQ Quiz 5" },
        { number: "6", name: "Chapter 11: Circle MCQ Quiz 6" },
      ],
    },
    "Chapter 12: Conic Sections": {
      lectures: [
        { number: "1", name: "Chapter 12: Parabola Terminology" },
        { number: "2", name: "Chapter 12: Parabola Summary" },
        { number: "3", name: "Chapter 12: Tangent at a Point on a Parabola" },
        { number: "4", name: "Chapter 12: Standard Equation of Ellipse" },
        { number: "5", name: "Chapter 12: Summary of Ellipse" },
        { number: "6", name: "Chapter 12: Equation of Tangent" },
      ],
      dpps: [
        { number: "1", name: "Chapter 12: Conic Sections MCQ Quiz 1" },
        { number: "2", name: "Chapter 12: Conic Sections MCQ Quiz 2" },
        { number: "3", name: "Chapter 12: Conic Sections MCQ Quiz 3" },
        { number: "4", name: "Chapter 12: Conic Sections MCQ Quiz 4" },
        { number: "5", name: "Chapter 12: Conic Sections MCQ Quiz 5" },
        { number: "6", name: "Chapter 12: Conic Sections MCQ Quiz 6" },
      ],
    },
    "Chapter 13: Logarithm": {
      lectures: [
        { number: "1", name: "Chapter 13: Definition Basics of Logarithms" },
        { number: "2", name: "Chapter 13: Laws of Logarithm" },
        { number: "3", name: "Chapter 13: Logarithmic Applications" },
        { number: "4", name: "Chapter 13: Logarithm Problems" },
        { number: "5", name: "Chapter 13: Logarithm Practice" },
        { number: "6", name: "Chapter 13: Logarithm Advanced" },
      ],
      dpps: [
        { number: "1", name: "Chapter 13: Logarithm MCQ Quiz 1" },
        { number: "2", name: "Chapter 13: Logarithm MCQ Quiz 2" },
        { number: "3", name: "Chapter 13: Logarithm MCQ Quiz 3" },
        { number: "4", name: "Chapter 13: Logarithm MCQ Quiz 4" },
        { number: "5", name: "Chapter 13: Logarithm MCQ Quiz 5" },
        { number: "6", name: "Chapter 13: Logarithm MCQ Quiz 6" },
      ],
    },
    "Chapter 14: Functions": {
      lectures: [
        { number: "1", name: "Chapter 14: Definition of Function" },
        { number: "2", name: "Chapter 14: Types of Bracket" },
        { number: "3", name: "Chapter 14: Types of Bracket (Extended)" },
        { number: "4", name: "Chapter 14: Composite Function" },
        { number: "5", name: "Chapter 14: Types of Function" },
        { number: "6", name: "Chapter 14: Function Properties" },
      ],
      dpps: [
        { number: "1", name: "Chapter 14: Functions MCQ Quiz 1" },
        { number: "2", name: "Chapter 14: Functions MCQ Quiz 2" },
        { number: "3", name: "Chapter 14: Functions MCQ Quiz 3" },
        { number: "4", name: "Chapter 14: Functions MCQ Quiz 4" },
        { number: "5", name: "Chapter 14: Functions MCQ Quiz 5" },
        { number: "6", name: "Chapter 14: Functions MCQ Quiz 6" },
      ],
    },
    "Chapter 15: Limits": {
      lectures: [
        { number: "1", name: "Chapter 15: Algebra of Limits" },
        { number: "2", name: "Chapter 15: Limits of Trigonometric Function" },
        { number: "3", name: "Chapter 15: Limits of Exponential Function" },
        { number: "4", name: "Chapter 15: L'Hospital Rule" },
        { number: "5", name: "Chapter 15: Limits of Logarithmic Function" },
        { number: "6", name: "Chapter 15: LH Rule Applications" },
      ],
      dpps: [
        { number: "1", name: "Chapter 15: Limits MCQ Quiz 1" },
        { number: "2", name: "Chapter 15: Limits MCQ Quiz 2" },
        { number: "3", name: "Chapter 15: Limits MCQ Quiz 3" },
        { number: "4", name: "Chapter 15: Limits MCQ Quiz 4" },
        { number: "5", name: "Chapter 15: Limits MCQ Quiz 5" },
        { number: "6", name: "Chapter 15: Limits MCQ Quiz 6" },
      ],
    },
    "Chapter 16: Continuity": {
      lectures: [
        { number: "1", name: "Chapter 16: Continuity at point" },
        { number: "2", name: "Chapter 16: Discontinuity" },
        { number: "3", name: "Chapter 16: Practice Questions" },
        { number: "4", name: "Chapter 16: Practice Questions (Partial)" },
        { number: "5", name: "Chapter 16: Continuity Theorems" },
        { number: "6", name: "Chapter 16: Continuity Applications" },
      ],
      dpps: [
        { number: "1", name: "Chapter 16: Continuity MCQ Quiz 1" },
        { number: "2", name: "Chapter 16: Continuity MCQ Quiz 2" },
        { number: "3", name: "Chapter 16: Continuity MCQ Quiz 3" },
        { number: "4", name: "Chapter 16: Continuity MCQ Quiz 4" },
        { number: "5", name: "Chapter 16: Continuity MCQ Quiz 5" },
        { number: "6", name: "Chapter 16: Continuity MCQ Quiz 6" },
      ],
    },
    "Chapter 17: Measures of Dispersion": {
      lectures: [
        { number: "1", name: "Chapter 17: Practice Questions" },
        { number: "2", name: "Chapter 17: Variance" },
        { number: "3", name: "Chapter 17: Practice Questions (Extended)" },
        { number: "4", name: "Chapter 17: Coefficient of Variation" },
        { number: "5", name: "Chapter 17: Dispersion Methods" },
        { number: "6", name: "Chapter 17: Standard Deviation" },
      ],
      dpps: [
        { number: "1", name: "Chapter 17: Measures of Dispersion MCQ Quiz 1" },
        { number: "2", name: "Chapter 17: Measures of Dispersion MCQ Quiz 2" },
        { number: "3", name: "Chapter 17: Measures of Dispersion MCQ Quiz 3" },
        { number: "4", name: "Chapter 17: Measures of Dispersion MCQ Quiz 4" },
        { number: "5", name: "Chapter 17: Measures of Dispersion MCQ Quiz 5" },
        { number: "6", name: "Chapter 17: Measures of Dispersion MCQ Quiz 6" },
      ],
    },
    "Chapter 18: Probability": {
      lectures: [
        { number: "1", name: "Chapter 18: Basic Terminologies" },
        { number: "2", name: "Chapter 18: Concept of Probability" },
        { number: "3", name: "Chapter 18: Union of Two Events" },
        { number: "4", name: "Chapter 18: Conditional Probability" },
        { number: "5", name: "Chapter 18: Total Probability Law" },
        { number: "6", name: "Chapter 18: Bayes' Theorem" },
      ],
      dpps: [
        { number: "1", name: "Chapter 18: Probability MCQ Quiz 1" },
        { number: "2", name: "Chapter 18: Probability MCQ Quiz 2" },
        { number: "3", name: "Chapter 18: Probability MCQ Quiz 3" },
        { number: "4", name: "Chapter 18: Probability MCQ Quiz 4" },
        { number: "5", name: "Chapter 18: Probability MCQ Quiz 5" },
        { number: "6", name: "Chapter 18: Probability MCQ Quiz 6" },
      ],
    },
    "Chapter 19: Differentiation": {
      lectures: [
        { number: "1", name: "Chapter 19: Differentiation Introduction" },
        { number: "2", name: "Chapter 19: Concept of Derivative" },
        { number: "3", name: "Chapter 19: Product Rule" },
        { number: "4", name: "Chapter 19: Differentiation Formula" },
        { number: "5", name: "Chapter 19: Derivative of Composite Function" },
        { number: "6", name: "Chapter 19: Quotient Rule and Chain Rule" },
      ],
      dpps: [
        { number: "1", name: "Chapter 19: Differentiation MCQ Quiz 1" },
        { number: "2", name: "Chapter 19: Differentiation MCQ Quiz 2" },
        { number: "3", name: "Chapter 19: Differentiation MCQ Quiz 3" },
        { number: "4", name: "Chapter 19: Differentiation MCQ Quiz 4" },
        { number: "5", name: "Chapter 19: Differentiation MCQ Quiz 5" },
        { number: "6", name: "Chapter 19: Differentiation MCQ Quiz 6" },
      ],
    },
  },
};

export class SqliteStorage implements IStorage {
  initializeSyllabus(): void {
    // Check if data already exists
    const lectureCount = db.prepare("SELECT COUNT(*) as count FROM lectures").get() as { count: number };
    if (lectureCount.count > 0) return; // Already seeded

    // Seed Physics
    Object.entries(SYLLABUS_DATA.physics).forEach(([chapter, data]) => {
      data.lectures.forEach((lecture) => {
        db.prepare(`
          INSERT INTO lectures (id, subject, chapter, lecture_number, lecture_name)
          VALUES (?, ?, ?, ?, ?)
        `).run(randomUUID(), "Physics", chapter, lecture.number, lecture.name);
      });
      data.dpps.forEach((dpp) => {
        db.prepare(`
          INSERT INTO dpps (id, subject, chapter, dpp_number, dpp_name)
          VALUES (?, ?, ?, ?, ?)
        `).run(randomUUID(), "Physics", chapter, dpp.number, dpp.name);
      });
    });

    // Seed Chemistry
    Object.entries(SYLLABUS_DATA.chemistry).forEach(([chapter, data]) => {
      data.lectures.forEach((lecture) => {
        db.prepare(`
          INSERT INTO lectures (id, subject, chapter, lecture_number, lecture_name)
          VALUES (?, ?, ?, ?, ?)
        `).run(randomUUID(), "Chemistry", chapter, lecture.number, lecture.name);
      });
      data.dpps.forEach((dpp) => {
        db.prepare(`
          INSERT INTO dpps (id, subject, chapter, dpp_number, dpp_name)
          VALUES (?, ?, ?, ?, ?)
        `).run(randomUUID(), "Chemistry", chapter, dpp.number, dpp.name);
      });
    });

    // Seed Mathematics
    Object.entries(SYLLABUS_DATA.mathematics).forEach(([chapter, data]) => {
      data.lectures.forEach((lecture) => {
        db.prepare(`
          INSERT INTO lectures (id, subject, chapter, lecture_number, lecture_name)
          VALUES (?, ?, ?, ?, ?)
        `).run(randomUUID(), "Mathematics", chapter, lecture.number, lecture.name);
      });
      data.dpps.forEach((dpp) => {
        db.prepare(`
          INSERT INTO dpps (id, subject, chapter, dpp_number, dpp_name)
          VALUES (?, ?, ?, ?, ?)
        `).run(randomUUID(), "Mathematics", chapter, dpp.number, dpp.name);
      });
    });

    console.log("✅ Syllabus data initialized successfully");
  }
  getUserCount(): number {
    const result = db.prepare("SELECT COUNT(*) as count FROM users").get() as { count: number };
    return result.count;
  }

  getUserByEmail(email: string): any | undefined {
    return db.prepare("SELECT * FROM users WHERE email = ?").get(email);
  }

  getUserById(id: string): any | undefined {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id);
  }

  getUsersByRivalCode(rivalCode: string): any[] {
    return db.prepare("SELECT * FROM users WHERE rival_code = ?").all(rivalCode);
  }

  createUser(user: { name: string; email: string; password: string; pwBatchId: string; rivalCode: string }): any {
    const id = randomUUID();
    const users = this.getUsersByRivalCode(user.rivalCode);
    const userIcon = users.length === 0 ? "🦊" : "⚡";
    
    db.prepare(`
      INSERT INTO users (id, name, email, password, pw_batch_id, rival_code, user_icon, theme)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, user.name, user.email, user.password, user.pwBatchId, user.rivalCode, userIcon, "light");
    
    db.prepare(`
      INSERT INTO streaks (id, user_id, current_streak, last_activity_date)
      VALUES (?, ?, 0, NULL)
    `).run(randomUUID(), id);
    
    return this.getUserById(id);
  }

  updateUserTheme(userId: string, theme: string): void {
    db.prepare("UPDATE users SET theme = ? WHERE id = ?").run(theme, userId);
  }

  createLecture(lecture: { subject: string; chapter: string; number: string; name: string }): any {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO lectures (id, subject, chapter, lecture_number, lecture_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, lecture.subject, lecture.chapter, lecture.number, lecture.name);
    return db.prepare("SELECT * FROM lectures WHERE id = ?").get(id);
  }

  getLectures(): any[] {
    return db.prepare("SELECT * FROM lectures ORDER BY subject, chapter, lecture_number").all();
  }

  getLectureCompletions(userId: string): string[] {
    const rows = db.prepare("SELECT lecture_id FROM lecture_completions WHERE user_id = ?").all(userId) as { lecture_id: string }[];
    return rows.map(r => r.lecture_id);
  }

  toggleLectureCompletion(lectureId: string, userId: string): boolean {
    const existing = db.prepare("SELECT * FROM lecture_completions WHERE lecture_id = ? AND user_id = ?").get(lectureId, userId);
    
    if (existing) {
      db.prepare("DELETE FROM lecture_completions WHERE lecture_id = ? AND user_id = ?").run(lectureId, userId);
      return false;
    } else {
      const id = randomUUID();
      db.prepare(`
        INSERT INTO lecture_completions (id, lecture_id, user_id)
        VALUES (?, ?, ?)
      `).run(id, lectureId, userId);
      return true;
    }
  }

  createDpp(dpp: { subject: string; chapter: string; number: string; name: string }): any {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO dpps (id, subject, chapter, dpp_number, dpp_name)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, dpp.subject, dpp.chapter, dpp.number, dpp.name);
    return db.prepare("SELECT * FROM dpps WHERE id = ?").get(id);
  }

  getDpps(): any[] {
    return db.prepare("SELECT * FROM dpps ORDER BY subject, chapter, dpp_number").all();
  }

  getDppCompletions(userId: string): string[] {
    const rows = db.prepare("SELECT dpp_id FROM dpp_completions WHERE user_id = ?").all(userId) as { dpp_id: string }[];
    return rows.map(r => r.dpp_id);
  }

  toggleDppCompletion(dppId: string, userId: string): boolean {
    const existing = db.prepare("SELECT * FROM dpp_completions WHERE dpp_id = ? AND user_id = ?").get(dppId, userId);
    
    if (existing) {
      db.prepare("DELETE FROM dpp_completions WHERE dpp_id = ? AND user_id = ?").run(dppId, userId);
      return false;
    } else {
      const id = randomUUID();
      db.prepare(`
        INSERT INTO dpp_completions (id, dpp_id, user_id)
        VALUES (?, ?, ?)
      `).run(id, dppId, userId);
      return true;
    }
  }

  createSchoolLesson(lesson: { subject: string; lessonNumber: string; lessonName: string; monthRange: string }): any {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO school_lessons (id, subject, lesson_number, lesson_name, month_range)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, lesson.subject, lesson.lessonNumber, lesson.lessonName, lesson.monthRange);
    return db.prepare("SELECT * FROM school_lessons WHERE id = ?").get(id);
  }

  getSchoolLessons(): any[] {
    return db.prepare("SELECT * FROM school_lessons ORDER BY month_range, subject, lesson_number").all();
  }

  getSchoolLessonCompletions(userId: string): string[] {
    const rows = db.prepare("SELECT lesson_id FROM school_lesson_completions WHERE user_id = ?").all(userId) as { lesson_id: string }[];
    return rows.map(r => r.lesson_id);
  }

  toggleSchoolLessonCompletion(lessonId: string, userId: string): boolean {
    const existing = db.prepare("SELECT * FROM school_lesson_completions WHERE lesson_id = ? AND user_id = ?").get(lessonId, userId);
    
    if (existing) {
      db.prepare("DELETE FROM school_lesson_completions WHERE lesson_id = ? AND user_id = ?").run(lessonId, userId);
      return false;
    } else {
      const id = randomUUID();
      db.prepare(`
        INSERT INTO school_lesson_completions (id, lesson_id, user_id)
        VALUES (?, ?, ?)
      `).run(id, lessonId, userId);
      return true;
    }
  }

  createChatMessage(message: { userId: string; message: string }): any {
    const id = randomUUID();
    db.prepare(`
      INSERT INTO chat_messages (id, user_id, message)
      VALUES (?, ?, ?)
    `).run(id, message.userId, message.message);
    return db.prepare("SELECT * FROM chat_messages WHERE id = ?").get(id);
  }

  getChatMessages(): any[] {
    return db.prepare("SELECT * FROM chat_messages ORDER BY created_at ASC").all();
  }

  getOrCreateStreak(userId: string): any {
    let streak = db.prepare("SELECT * FROM streaks WHERE user_id = ?").get(userId);
    if (!streak) {
      const id = randomUUID();
      db.prepare(`
        INSERT INTO streaks (id, user_id, current_streak, last_activity_date)
        VALUES (?, ?, 0, NULL)
      `).run(id, userId);
      streak = db.prepare("SELECT * FROM streaks WHERE user_id = ?").get(userId);
    }
    return streak;
  }

  updateStreak(userId: string, streak: number, lastActivityDate: string): void {
    db.prepare(`
      UPDATE streaks
      SET current_streak = ?, last_activity_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ?
    `).run(streak, lastActivityDate, userId);
  }

  getAllCompletionsForUser(userId: string): any[] {
    const lectures = db.prepare(`
      SELECT completed_at as date FROM lecture_completions WHERE user_id = ?
    `).all(userId);
    
    const dpps = db.prepare(`
      SELECT completed_at as date FROM dpp_completions WHERE user_id = ?
    `).all(userId);
    
    const lessons = db.prepare(`
      SELECT completed_at as date FROM school_lesson_completions WHERE user_id = ?
    `).all(userId);
    
    return [...lectures, ...dpps, ...lessons];
  }

  initializeAchievements(): void {
    const existing = db.prepare("SELECT COUNT(*) as count FROM achievements").get() as { count: number };
    if (existing.count > 0) return;

    const achievements = [
      { name: "First Step", description: "Complete your first lecture", icon: "🚀", category: "starter" },
      { name: "Problem Solver", description: "Complete your first DPP", icon: "🧩", category: "starter" },
      { name: "Scholar", description: "Complete your first school lesson", icon: "📖", category: "starter" },
      { name: "Lecture Legend", description: "Complete 10 lectures", icon: "📚", category: "milestone" },
      { name: "DPP Master", description: "Complete 25 DPPs", icon: "✨", category: "milestone" },
      { name: "School Hero", description: "Complete 15 school lessons", icon: "🏫", category: "milestone" },
      { name: "Century Club", description: "Complete 100 tasks total", icon: "💯", category: "milestone" },
      { name: "Physics Prodigy", description: "Complete 20 physics lectures", icon: "⚛️", category: "subject" },
      { name: "Chemistry Champion", description: "Complete 20 chemistry lectures", icon: "🧪", category: "subject" },
      { name: "Math Wizard", description: "Complete 20 math lectures", icon: "🔢", category: "subject" },
      { name: "Streak Starter", description: "Achieve a 7-day streak", icon: "🔥", category: "streak" },
      { name: "Streak Master", description: "Achieve a 30-day streak", icon: "🌟", category: "streak" },
      { name: "Unstoppable", description: "Achieve a 60-day streak", icon: "⚡", category: "streak" },
      { name: "Perfect Physics", description: "Complete all physics lectures and DPPs", icon: "🎯", category: "perfect" },
      { name: "Perfect Chemistry", description: "Complete all chemistry lectures and DPPs", icon: "🔬", category: "perfect" },
      { name: "Perfect Math", description: "Complete all math lectures and DPPs", icon: "📐", category: "perfect" },
      { name: "Balanced Scholar", description: "Complete at least 5 lectures in each subject", icon: "⚖️", category: "subject" },
      { name: "All-Rounder", description: "Complete 100+ lectures", icon: "🏆", category: "milestone" },
      { name: "DPP Enthusiast", description: "Complete 50 DPPs", icon: "💪", category: "milestone" },
      { name: "Lesson Collector", description: "Complete 30 school lessons", icon: "📚", category: "milestone" },
      { name: "Consistency King", description: "Maintain a streak for 14 days", icon: "👑", category: "streak" },
      { name: "Rival Challenger", description: "Complete 50 tasks before your rival", icon: "⚔️", category: "competitive" },
      { name: "Early Bird", description: "Complete first task of the day", icon: "🌅", category: "starter" },
      { name: "Night Owl", description: "Complete 10 tasks late at night", icon: "🌙", category: "special" },
      { name: "Comeback Kid", description: "Recover a 3-day streak after a break", icon: "💫", category: "special" },
    ];

    achievements.forEach(ach => {
      db.prepare(`
        INSERT INTO achievements (id, name, description, icon, category, condition)
        VALUES (?, ?, ?, ?, ?, ?)
      `).run(randomUUID(), ach.name, ach.description, ach.icon, ach.category, ach.name);
    });
  }

  getAchievements(): any[] {
    return db.prepare("SELECT * FROM achievements ORDER BY category, name").all();
  }

  getUserAchievements(userId: string): any[] {
    return db.prepare(`
      SELECT a.*, ua.earned_at FROM achievements a
      LEFT JOIN user_achievements ua ON a.id = ua.id AND ua.user_id = ?
      ORDER BY a.category, a.name
    `).all(userId);
  }

  awardAchievement(userId: string, achievementId: string): boolean {
    const existing = db.prepare("SELECT * FROM user_achievements WHERE user_id = ? AND achievement_id = ?").get(userId, achievementId);
    if (existing) return false;

    db.prepare(`
      INSERT INTO user_achievements (id, user_id, achievement_id)
      VALUES (?, ?, ?)
    `).run(randomUUID(), userId, achievementId);
    return true;
  }

  hasUserEarned(userId: string, achievementId: string): boolean {
    const result = db.prepare("SELECT COUNT(*) as count FROM user_achievements WHERE user_id = ? AND achievement_id = ?").get(userId, achievementId) as { count: number };
    return result.count > 0;
  }
}

export const storage = new SqliteStorage();