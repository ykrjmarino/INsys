import { useNavigate } from "react-router-dom";

export const ForbiddenPage = () => {
  const navigate = useNavigate();

  return (
    <div className="body-error-status">
      <h1 class="error-code">403</h1>
      <h2 class="error-title">Forbidden</h2>
      <p class="error-description">You don't have permission to access this page.</p>
      <button onClick={() => navigate('/')} class="error-home-button">Go to Homepage</button>
    </div>
  )
}

export const UnauthorizedPage = () => {
  const navigate = useNavigate();

  return (
    <div className="body-error-status">
      <h1 class="error-code">401</h1>
      <h2 class="error-title">Unauthorized Access</h2>
      <p class="error-description">You don’t have permission to view this page.</p>
      <button onClick={() => navigate('/')} class="error-home-button">Go to Homepage</button>
    </div>
  )
}

export const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="body-error-status">
      <h1 class="error-code">404</h1>
      <h2 class="error-title">Page Not Found</h2>
      <p class="error-description">The page you're looking for doesn't exist or has been moved.</p>
      <button onClick={() => navigate('/')} class="error-home-button">Go to Homepage</button>
    </div>
  );
}
