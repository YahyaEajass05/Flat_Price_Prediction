from setuptools import setup, find_packages

# Read requirements from file
with open('results/reports/requirements.txt', 'r') as f:
    requirements = [line.strip() for line in f if line.strip() and not line.startswith('#')]

setup(
    name='flat_price_prediction',
    version='1.0.0',
    description='Machine Learning Pipeline for Flat Price Prediction',
    author='Your Name',
    author_email='your.email@example.com',
    packages=find_packages(),
    python_requires='>=3.8',
    install_requires=requirements,
    entry_points={
        'console_scripts': [
            'train-model=scripts.train:main',
            'predict-price=scripts.predict:main',
            'evaluate-model=scripts.evaluate:main',
        ],
    },
    classifiers=[
        'Development Status :: 4 - Beta',
        'Intended Audience :: Developers',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.8',
        'Programming Language :: Python :: 3.9',
        'Programming Language :: Python :: 3.10',
        'Programming Language :: Python :: 3.11',
    ],
)
