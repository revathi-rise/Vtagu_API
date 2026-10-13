export const parseBool = (val: any): boolean => {
  if (val === true || val === false) return val;
  if (val === 1 || val === '1' || val === 'true') return true;
  if (val === 0 || val === '0' || val === 'false') return false;
  return false;
};

export const isKidsApproved = (item: any): boolean => {
  if (!item) return false;
  const val = item.kids_restriction ?? item.is_kids_approved ?? item.kidsRestriction ?? item.isKidsApproved;
  return parseBool(val);
};

export const checkKidsMode = (
  user?: { is_kids_mode?: boolean } | null,
  explicitFlag?: string | boolean,
  headerFlag?: string | boolean,
): boolean => {
  if (user && parseBool(user.is_kids_mode)) {
    return true;
  }
  if (explicitFlag !== undefined && parseBool(explicitFlag)) {
    return true;
  }
  if (headerFlag !== undefined && parseBool(headerFlag)) {
    return true;
  }
  return false;
};
