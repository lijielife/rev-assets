# coding=utf-8
import io
import os
import re
from setuptools import setup, find_packages


def get_path(*args):
    return os.path.join(os.path.dirname(__file__), *args)


def read_from(*args):
    filepath = get_path(*args)
    with io.open(filepath, 'rt', encoding='utf8') as f:
        return f.read()


data = read_from('rev_assets/__init__.py').encode('utf8')
version = (re.search(b"__version__\s*=\s*u?'([^']+)'", data).group(1)).decode('utf8').strip()
desc = read_from('README.rst').strip()


setup(
    name='rev-assets',
    version=version,
    author='Juan-Pablo Scaletti',
    author_email='juanpablo@lucumalabs.com',
    packages=find_packages(),
    include_package_data=True,
    zip_safe=False,
    url='http://github.com/jpscaletti/rev-assets',
    license='BSD-3-Clause (see LICENSE)',
    description='Make possible to use hashed static assets generated by tools like Gulp or Webpack',
    long_description=desc,
    classifiers=[
        'Development Status :: 5 - Production/Stable',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 2.7',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.3',
        'Programming Language :: Python :: 3.4',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
    ]
)
