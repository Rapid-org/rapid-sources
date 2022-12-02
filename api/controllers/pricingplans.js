exports.getPricingPlanStorageLimit = function (plan) {
  return 50;
}

exports.getPricingPlanProjectLimit = function (plan) {
  return -1;
}

exports.getPricingPlanPackageName = function (plan, name, packageName, displayName) {
  return packageName;
}
