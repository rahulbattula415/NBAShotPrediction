import numpy as np

class LogisticRegressionModel:
    def __init__(self, lr=0.01, num_iterations=1000):
        self.lr = lr
        self.num_iterations = num_iterations
    
    def sigmoid(self, z):
        return 1 / (1 + np.exp(-z))
    
    def fit(self, x, y):
        self.theta = np.zeros(x.shape[1])
        for _ in range(self.num_iterations):
            z = x @ self.theta
            h = self.sigmoid(z)
            gradient = x.T @ (h - y) / y.size
            self.theta -= self.lr * gradient
    
    def predict_proba(self, x):
        return self.sigmoid(x @ self.theta)
    
    def predict(self, x, threshold=0.5):
        return (self.predict_proba(x) >= threshold).astype(int)