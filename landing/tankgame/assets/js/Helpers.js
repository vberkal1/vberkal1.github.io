class Helpers {
  static flipObj = (data) => Object.fromEntries(
    Object
      .entries(data)
      .map(([key, value]) => [value, key])
  );
}