export default function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      // Map validation errors to a clear error message
      const errorMsg = result.error.errors.map(err => {
        const path = err.path.join(".");
        return path ? `${path}: ${err.message}` : err.message;
      }).join(", ");
      return res.status(400).json({ error: errorMsg });
    }
    req.body = result.data;
    next();
  };
}
