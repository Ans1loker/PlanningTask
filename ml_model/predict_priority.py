import sys
import pandas as pd
import joblib

# Получение данных из аргументов командной строки
importance = int(sys.argv[1])
urgency = int(sys.argv[2])

# Загрузка модели
model = joblib.load('task_priority_model.pkl')

# Создание DataFrame для предсказания
new_task = pd.DataFrame({'importance': [importance], 'urgency': [urgency]})

# Предсказание приоритета
predicted_priority = model.predict(new_task)

# Вывод результата
print(predicted_priority[0])
