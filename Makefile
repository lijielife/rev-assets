.PHONY: all

clean: clean-build clean-pyc

clean-build:
	rm -rf build/
	rm -rf dist/
	rm -rf *.egg-info

clean-pyc:
	find . -name '*.pyc' -exec rm -f {} +
	find . -name '*.pyo' -exec rm -f {} +
	find . -name '*~' -exec rm -f {} +
	find . -name '__pycache__' -exec rm -rf {} +

lint:
	flake8 rev_assets tests.py --ignore=E501

coverage:
	py.test -x --cov-config .coveragerc --cov rev_assets --cov-report html tests.py
	open htmlcov/index.html

test:
	py.test -x tests.py

publish: clean
	python setup.py sdist upload
	python setup.py bdist_wheel upload

sdist: clean
	python setup.py sdist
	ls -l dist

wheel: clean
	pip wheel --wheel-dir=wheel .
