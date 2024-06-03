import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Пример данных
data = {
    'task_name': ['Task1', 'Task2', 'Task3'],
    'importance': [3, 2, 5],
    'urgency': [2, 4, 1],
    'priority': [1, 2, 1]
}

df = pd.DataFrame(data)

# Разделение данных на признаки и метки
X = df[['importance', 'urgency']]
y = df['priority']

# Обучение модели
model = RandomForestClassifier()
model.fit(X, y)

# Сохранение модели
joblib.dump(model, 'task_priority_model.pkl')
