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
	flake8 rev_assets.py tests.py --ignore=E501

test:
	py.test -x tests.py

test-all:
	tox

flake8:
	flake8 rev_assets.py tests.py

publish: clean
	python setup.py sdist upload
	python setup.py bdist_wheel upload

sdist: clean
	python setup.py sdist
	ls -l dist

wheel: clean
	pip wheel --wheel-dir=wheel .
