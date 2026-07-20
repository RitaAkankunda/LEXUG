export type AppColors = {
  background: string;
  surface: string;
  surfaceMuted: string;
  text: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryDark: string;
  gold: string;
  green: string;
  ink: string;
  danger: string;
  success: string;
  warningSurface: string;
  warningBorder: string;
  successSurface: string;
  successBorder: string;
  primarySurface: string;
  dangerSurface: string;
};

export const lightColors: AppColors = {
  background: '#F7F6F1',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F3EF',
  text: '#181818',
  textMuted: '#666D73',
  border: '#DFE3DE',
  primary: '#C91F37',
  primaryDark: '#8F1427',
  gold: '#F4C430',
  green: '#16855F',
  ink: '#111111',
  danger: '#B42318',
  success: '#167C51',
  warningSurface: '#FFF6D7',
  warningBorder: '#E9CC65',
  successSurface: '#EAF7F0',
  successBorder: '#A9DCC3',
  primarySurface: '#FFF1F3',
  dangerSurface: '#FFF0EF',
};

export const darkColors: AppColors = {
  background: '#10120F',
  surface: '#181B18',
  surfaceMuted: '#222821',
  text: '#F4F1E8',
  textMuted: '#AEB6AD',
  border: '#343A33',
  primary: '#FF5A76',
  primaryDark: '#FFB1BE',
  gold: '#F4C430',
  green: '#5ED0A0',
  ink: '#050605',
  danger: '#FF897D',
  success: '#68D391',
  warningSurface: '#332B13',
  warningBorder: '#6E5A1D',
  successSurface: '#123125',
  successBorder: '#2D7657',
  primarySurface: '#321820',
  dangerSurface: '#321918',
};

export const colors = lightColors;

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
};

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
  },
};
